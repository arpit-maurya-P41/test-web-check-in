import { MemberOptionsProps } from "@/type/PropTypes";
import { EllipsisOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { Checkbox, Dropdown } from "antd";
  
  const MemberOptions: React.FC<MemberOptionsProps> = ({
    userId,
    checked,
    onDelete,
    onCheckInChange,
  }) => {
    const menuProps = {
      items: [
        {
          key: 'checkin',
          label: (
            <Checkbox
              title="Allow Check-in"
              onChange={(e) => onCheckInChange(userId, e.target.checked)}
              defaultChecked={checked}
              onClick={(e) => e.stopPropagation()}
            >
              Allow Check-in
            </Checkbox>
          ),
        },
        {
          key: 'delete',
          label: (
            <span
              style={{ color: 'red', fontSize: 14, cursor: 'pointer' }}
              onClick={() => onDelete(userId)}
            >
              <UserDeleteOutlined style={{ marginRight: 8 }} />
              Remove
            </span>
          ),
        },
      ],
    };
  
    return (
      <Dropdown menu={menuProps} trigger={['click']}>
        <EllipsisOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
      </Dropdown>
    );
  };

export default MemberOptions;
  