"use client";

import React, { useState } from "react";
import { Modal, Input, Checkbox } from "antd";
import { useNotification } from "../NotificationProvider";

interface AddMembersModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (emails: string[]) => Promise<void>;
}

const AddMembersModal: React.FC<AddMembersModalProps> = ({ open, onClose, onSave }) => {
  const [emailInput, setEmailInput] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [checkedEmails, setCheckedEmails] = useState<string[]>([]);
  const notify = useNotification();

  const handleAddEmail = () => {
    if (!emailInput.trim()) return;
    if (!emailList.includes(emailInput.trim())) {
      const newEmail = emailInput.trim();
      setEmailList([...emailList, newEmail]);
      setCheckedEmails([...checkedEmails, newEmail]);
    }
    setEmailInput("");
  };

  const handleSave = async () => {
    if (!checkedEmails || checkedEmails.length === 0) {
        notify("warning", "Please add at least one email before saving.");
        return;
      }
    try {
      await onSave(checkedEmails);
      handleReset();
    } catch {
      console.log("Failed to save users.");
    }
  };

  const handleReset = () => {
    setEmailInput("");
    setEmailList([]);
    setCheckedEmails([]);
    onClose();
  };

  return (
    <Modal
      title="Add New Members"
      open={open}
      onCancel={handleReset}
      onOk={handleSave}
      okText="Save"
      cancelText="Cancel"
    >
      <Input.Search
        placeholder="Enter email"
        enterButton="Add"
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
        onSearch={handleAddEmail}
      />

      {emailList.length > 0 && (
        <Checkbox.Group
          style={{ display: "flex", flexDirection: "column", marginTop: 16 }}
          value={checkedEmails}
          onChange={(list) => setCheckedEmails(list as string[])}
        >
          {emailList.map((email) => (
            <Checkbox key={email} value={email}>
              {email}
            </Checkbox>
          ))}
        </Checkbox.Group>
      )}
    </Modal>
  );
};

export default AddMembersModal;
