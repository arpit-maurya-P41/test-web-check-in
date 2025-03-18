import { NextResponse } from 'next/server';
// import { App } from '@slack/bolt';

// const app = new App({
//   token: process.env.SLACK_BOT_TOKEN,
//   signingSecret: process.env.SLACK_SIGNING_SECRET
// });

// app.event("app_home_opened", async ({ event, say, client }) => {
//   console.log("app_home_opened event detected", event.user);
//   await say(`Hello <@${event.user}>! Welcome to the app from Next JS.`);
//   try {
//       client.views.publish({
//           user_id: event.user,
//           view: {
//               type: "home",
//               blocks: [
//                   {
//                       type: "section",
//                       text: {
//                           type: "plain_text",
//                           text: "Welcome to Checkin Hero App! 🎉",
//                           emoji: true
//                       }
//                   }
//               ]
//           }
//       });
//   } catch (error) {
//       console.error(error);
//   }
// });

export async function GET() {
  return NextResponse.json({ message: 'Hello!' });
}

