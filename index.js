const { App, HTTPReceiver } = require("@slack/bolt");
require("dotenv").config();
const { Pool } = require("pg");
const axios = require("axios");
const pool = require("./config/db");

async function insertCheckIn(userId, channel_id, goal, blocker, feeling) {
    const query = `
        INSERT INTO checkins (user_id, channel_id, goal, blocker, feeling)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [userId, channel_id, goal, blocker, feeling];

    try {
        const res = await pool.query(query, values);
        console.log("Check-in saved:");
    } catch (err) {
        console.error("Error inserting check-in:", err);
    }
}

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
    await app.start(process.env.PORT || 3000);

    console.log("⚡️ CheckIn app is running!");
}
)();

app.event("app_home_opened", async ({ event, say, client }) => {
    console.log("app_home_opened event detected", event.user);
    await say(`Hello <@${event.user}>! Welcome to the app.`);
    try {
        client.views.publish({
            user_id: event.user,
            view: {
                type: "home",
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "plain_text",
                            text: "Welcome to Checkin Hero App! 🎉",
                            emoji: true
                        }
                    }
                ]
            }
        });
    } catch (error) {
        console.error(error);
    }
});

//#region Check In
app.command("/check-in", async ({ ack, body, client }) => {

    await ack();
    console.log("Command /check-in received");

    // Check if the user has already checked in for the day in the same channel
    const checkInQuery = `
        SELECT * FROM checkins
        WHERE user_id = $1 AND channel_id = $2 AND DATE(created_at) = CURRENT_DATE;
    `;
    const checkInValues = [body.user_id, body.channel_id];

    try {
        const checkInResult = await pool.query(checkInQuery, checkInValues);
        if (checkInResult.rows.length > 0) {
            await client.chat.postEphemeral({
                channel: body.channel_id,
                user: body.user_id,
                text: "You’ve already completed your check-in for this project today. Click <https://www.google.com/|here> to edit."
            });
            return;
        }
    } catch (err) {
        console.error("Error checking existing check-in:", err);
        await client.chat.postEphemeral({
            channel: body.channel_id,
            user: body.user_id,
            text: "An error occurred while checking your check-in status. Please try again later."
        });
        return;
    }

    const SMARTGoalsCheckValue = await areGoalsSMART(body.text);
    const updatedGoals = await getSMARTVersionOfGoals(body.text);


    await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: "Please confirm your check-in:",
        blocks: [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🎯 Goals Submission Review",
                    "emoji": true
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `👤 *Your submitted goals:* \n>>> ${body.text}`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `🧟 *Are your goals SMART:* ${SMARTGoalsCheckValue ? "✅" : "❌"}`
                }
            },
            {
                "type": "input",
                "block_id": "goal_input",
                "label": {
                    "type": "plain_text",
                    "text": "🤖 AI detected that your goals may not be SMART enough. Here's a suggested improvement!"
                },
                "element": {
                    "type": "plain_text_input",
                    "action_id": "goal_text",
                    "multiline": true,
                    "initial_value": updatedGoals
                }
            },
            // {
            //     "type": "section",
            //     "text": {
            //         "type": "mrkdwn",
            //         "text": `${!updatedGoals ? "⚠️ *Oops! Something went wrong.* \nWe couldn't process your SMART goal due to an issue with our AI service. Please try again later or proceed with your original input." : "___"}`
            //     }
            // },
            {
                "type": "input",
                "block_id": "blockers_block",
                "optional": true,
                "label": {
                    "type": "plain_text",
                    "text": "⚠️ Any Blockers?"
                },
                "element": {
                    "type": "plain_text_input",
                    "action_id": "blockers_input",
                    "multiline": true,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Mention any obstacles you faced (optional)..."
                    }
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "block_id": "mood_block",
                "text": {
                    "type": "mrkdwn",
                    "text": "😊 *How are you feeling today?*"
                },
                "accessory": {
                    "type": "static_select",
                    "action_id": "mood_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select your mood"
                    },
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "😃 Energized"
                            },
                            "value": "energized"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "😑 Neutral"
                            },
                            "value": "neutral"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "😞 Stressed"
                            },
                            "value": "stressed"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "💤 Tired"
                            },
                            "value": "tired"
                        }
                    ]
                }
            },
            {
                "type": "actions",
                "block_id": "goal_validation_actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "✅ Keep Original"
                        },
                        "style": "primary",
                        "action_id": "confirm_old",
                        "value": body.text
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "🖋️ Accept Edited"
                        },
                        "style": "primary",
                        "action_id": "confirm_suggested",
                        "value": updatedGoals
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "🛑 Cancel"
                        },
                        "style": "danger",
                        "action_id": "cancel",
                        "value": "cancel"
                    }
                ]
            },
            // {
            //     "type": "context",
            //     "elements": [
            //         {
            //             "type": "mrkdwn",
            //             "text": "📅 *Your check-in streak: 4 days in a row!* 🔥"
            //         }
            //     ]
            // }
        ]
    });
});

app.action("confirm_old", async ({ ack, body, client, respond, chat }) => {
    await ack();

    const goal = body.actions[0].value;
    const userId = body.user.id;
    const blocker = body.state.values.blockers_block.blockers_input.value;
    let feeling = "";
    if (body.state.values.mood_block.mood_select && body.state.values.mood_block.mood_select.selected_option) {
        feeling = body.state.values.mood_block.mood_select.selected_option.value;
    }

    const channelId = body.channel.id;

    await insertCheckIn(userId, channelId, goal, blocker, feeling);

    await axios.post(body.response_url, {
        delete_original: true
    });

    await client.chat.postMessage({
        channel: body.channel.id,
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "📢 @channel, a new check-in has been logged!"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `✅ <@${userId}>, your check-in is confirmed!`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `🎯 *Goals for the day:* \n ${goal}`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `🚫 *Blockers:* \n${blocker ? blocker : 'No blockers reported!'}`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "🚀 Let's support each other and stay on track! \n 📝 Goals logged successfully"
                }
            }
        ]
    });
});

app.action("cancel", async ({ ack, body, client, respond, chat }) => {
    await ack();

    await axios.post(body.response_url, {
        delete_original: true
    });
});

app.action("mood_select", async ({ ack, body, client, respond, chat }) => {
    await ack();
});

app.action("confirm_suggested", async ({ ack, body, client, respond, chat }) => {
    await ack();

    const goal = body.state.values.goal_input.goal_text.value;
    const blocker = body.state.values.blockers_block.blockers_input.value;
    let feeling = "";
    if (body.state.values.mood_block.mood_select && body.state.values.mood_block.mood_select.selected_option) {
        feeling = body.state.values.mood_block.mood_select.selected_option.value;
    }
    const userId = body.user.id;
    const channelId = body.channel.id;

    await insertCheckIn(userId, channelId, goal, blocker, feeling);

    await axios.post(body.response_url, {
        delete_original: true
    });

    await client.chat.postMessage({
        channel: body.channel.id,
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "📢 @channel, a new check-in has been logged!"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `✅ <@${userId}>, your check-in is confirmed!`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `🎯 *Goals for the day:* \n ${goal}`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `🚫 *Blockers:* \n${blocker ? blocker : 'No blockers reported! ✅'}`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "🚀 Let's support each other and stay on track! \n 📝 Goals logged successfully"
                }
            }
        ]
    });
});
//#endregion

//#region Open AI
async function areGoalsSMART(goals) {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [
                    {
                        role: "developer",
                        content: "Act as a SMART goal evaluator and determine whether the provided goals meet SMART criteria. Respond with true if the goal is SMART and false if it is not."
                    },
                    {
                        role: "user",
                        content: goals
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer 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"
                }
            }
        );

        return JSON.parse(response.data.choices[0].message.content.trim().toLowerCase());
    } catch (error) {
        console.error("Error getting AI response:", error);
        return false;
    }
}

async function getSMARTVersionOfGoals(goals) {
    const url = "https://api.openai.com/v1/chat/completions";
    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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",
        "Cookie": "__cf_bm=IarG4gxMGkbVoTrPG41wTS0VNHvAtDEODd5ngkvg974-1741785645-1.0.1.1-xSfort5YshYgvSLNyHIJkecFzV0FROruH7efHXu5nEfFjpesc29L0_kAhYLHIa6Q44C6iogSJKf.KNKeer3.t1_bEzA76DCAmkpkXG037b0; _cfuvid=WAW0.8PdRMGm4XwuxerIyS7hA0OzVImgTL27bjXWr3s-1741676025538-0.0.1.1-604800000"
    };
    const data = {
        model: "gpt-4o",
        messages: [
            {
                role: "developer",
                content: "Act as a SMART goal evaluator. If the provided goal is already SMART, give same goals. If not, rewrite it as a single-line SMART goal. Give response as final goals"
            },
            {
                role: "user",
                content: goals
            }
        ]
    };

    try {
        const response = await axios.post(url, data, { headers });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return goals;
    }
}
//#endregion

//#region Check Out
app.command("/check-out", async ({ ack, body, client }) => {

    console.log("Command /check-out received");

    await ack();

    const checkInQuery = `
        SELECT * FROM checkins
        WHERE user_id = $1 AND channel_id = $2 AND DATE(created_at) = CURRENT_DATE;
    `;
    const checkInValues = [body.user_id, body.channel_id];
    let checkInResults = [];

    try {
        const checkInResult = await pool.query(checkInQuery, checkInValues);
        checkInResults = checkInResult.rows;
        if (checkInResult.rows.length == 0) {
            await client.chat.postEphemeral({
                channel: body.channel_id,
                user: body.user_id,
                text: "You haven't checked in. Please check-in first."
            });
            return;
        }
    } catch (err) {
        console.error("Error checking morning check-in:");
        await client.chat.postEphemeral({
            channel: body.channel_id,
            user: body.user_id,
            text: "An error occurred while checking your check-in status. Please try again later."
        });
        return;
    }

    try {
        const checkOutQuery = `
        SELECT * FROM checkouts
        WHERE user_id = $1 AND channel_id = $2 AND DATE(created_at) = CURRENT_DATE;
    `;
        const checkOutValues = [body.user_id, body.channel_id];
        const checkOutResult = await pool.query(checkOutQuery, checkOutValues);
        if (checkOutResult.rows.length > 0) {
            await client.chat.postEphemeral({
                channel: body.channel_id,
                user: body.user_id,
                text: "You’ve already completed your check-out for this project today. Click <https://www.google.com/|here> to edit."
            });
            return;
        }
    }
    catch (err) {
        console.error("Error checking existing check-out:");
        await client.chat.postEphemeral({
            channel: body.channel_id,
            user: body.user_id,
            text: "An error occurred while checking your check-in status. Please try again later."
        });
        return;
    }

    await client.chat.postEphemeral({
        channel: body.channel_id,
        user: body.user_id,
        text: "Please confirm your check-in:",
        blocks: [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🌟 Daily Check-Out",
                    "emoji": true
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "input",
                "block_id": "updates_input",
                "label": {
                    "type": "plain_text",
                    "text": "🎯 What did you accomplish today?"
                },
                "element": {
                    "type": "plain_text_input",
                    "action_id": "updates_text",
                    "multiline": true,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Summarize your key achievements..."
                    },
                    "initial_value": checkInResults[0].goal
                }
            },
            {
                "type": "section",
                "block_id": "goals_block",
                "text": {
                    "type": "mrkdwn",
                    "text": "✅ *Did you complete your planned goals today?*"
                },
                "accessory": {
                    "type": "static_select",
                    "action_id": "goal_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select an option"
                    },
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "🎯 Yes, all done!"
                            },
                            "value": "true"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "🚧 No, faced blockers"
                            },
                            "value": "false"
                        }
                    ]
                }
            },
            {
                "type": "input",
                "block_id": "checkout_obstacles_block",
                "optional": true,
                "label": {
                    "type": "plain_text",
                    "text": "⚠️ Any obstacles today?"
                },
                "element": {
                    "type": "plain_text_input",
                    "action_id": "checkout_blockers_input",
                    "multiline": true,
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Mention any obstacles or challenges (optional)..."
                    }
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "block_id": "mood_block",
                "text": {
                    "type": "mrkdwn",
                    "text": "😊 *How are you feeling at the end of the day?*"
                },
                "accessory": {
                    "type": "static_select",
                    "action_id": "ckeckout_mood_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select your mood"
                    },
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "😃 Productive & Happy"
                            },
                            "value": "happy"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "😌 Neutral, just another day"
                            },
                            "value": "neutral"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "😞 Stressed & Overwhelmed"
                            },
                            "value": "stressed"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "💤 Tired, need rest"
                            },
                            "value": "tired"
                        }
                    ]
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "actions",
                "block_id": "checkout_actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "✅ Submit Check-Out"
                        },
                        "style": "primary",
                        "action_id": "confirm_checkout",
                        "value": "submit_checkout"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "❌ Cancel"
                        },
                        "style": "danger",
                        "action_id": "cancel_checkout",
                        "value": "cancel"
                    }
                ]
            }
        ]
    });
});

app.action("cancel_checkout", async ({ ack, body, client, respond, chat }) => {
    await ack();

    await axios.post(body.response_url, {
        delete_original: true
    });
});

app.action("confirm_checkout", async ({ ack, body, client, respond, chat }) => {
    await ack();

    const goal = body.state.values.updates_input.updates_text.value;
    const blocker = body.state.values.checkout_obstacles_block.checkout_blockers_input.value;
    let feeling = "";
    if (body.state.values.mood_block.mood_select && body.state.values.mood_block.mood_select.selected_option) {
        feeling = body.state.values.mood_block.mood_select.selected_option.value;
    }

    let goalsMet = false;
    if (body.state.values.goals_block.goal_select && body.state.values.goals_block.goal_select.selected_option) {
        goalsMet = JSON.parse(body.state.values.goals_block.goal_select.selected_option.value);
    }
    const userId = body.user.id;
    const channelId = body.channel.id;

    const checkOutQuery = `
        INSERT INTO checkouts (updates, blockers, goals_met, feeling, user_id, channel_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
    const checkOutValues = [goal, blocker, goalsMet, feeling, userId, channelId];

    console.log("Check-out values:", checkOutValues);

    try {
        const checkOutResult = await pool.query(checkOutQuery, checkOutValues);
        if (checkOutResult.rows.length == 0) {
            await client.chat.postEphemeral({
                channel: body.channel.id,
                user: body.user.id,
                text: "An error occurred while updating your check-out. Please try again later."
            });
            return;
        }
    } catch (err) {
        console.error("Error updating check-out:", err);
        await client.chat.postEphemeral({
            channel: body.channel.id,
            user: body.user.id,
            text: "An error occurred while updating your check-out. Please try again later."
        });
        return;
    }

    await axios.post(body.response_url, {
        delete_original: true
    });

    await client.chat.postMessage({
        channel: body.channel.id,
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "📢 @channel, a new check-out has been logged!"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `✅ <@${userId}>, your check-out is confirmed!`
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `
                        🎯 *Updates for the day:* \n ${goal}\n\n🚫 *Blockers:* ${blocker ? blocker : 'No blockers reported!'}\n\n${feeling ? `😊 *Feeling:* ${feeling}` : ""}
                    `
                }
            },
        ]
    });
});

app.action("ckeckout_mood_select", async ({ ack, body, client, respond, chat }) => {
    await ack();
});

app.action("goal_select", async ({ ack, body, client, respond, chat }) => {
    await ack();
});
//#endregion