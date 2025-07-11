import { DatePicker } from "antd";
import { RangePickerProps } from "antd/lib/date-picker";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface DateRangePickerProps {
  dates: [Dayjs, Dayjs];
  onRangeChange: (dates: RangePickerProps["value"]) => void;
  style?: React.CSSProperties;
}

const getDefaultDates = () =>
  [dayjs().subtract(6, "day"), dayjs()] as [Dayjs, Dayjs];

const predefinedRanges: Record<string, [dayjs.Dayjs, dayjs.Dayjs]> = {
  Today: [dayjs(), dayjs()],
  Yesterday: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
  "Last 7 Days": [dayjs().subtract(6, "day"), dayjs()],
  "Last 14 Days": [dayjs().subtract(13, "day"), dayjs()],
  "Last 30 Days": [dayjs().subtract(29, "day"), dayjs()],
  "This Month": [
    dayjs().startOf("month"),
    dayjs().isSame(dayjs().endOf("month"), "day")
      ? dayjs().endOf("month")
      : dayjs(),
  ],
  "Last Month": [
    dayjs().subtract(1, "month").startOf("month"),
    dayjs().subtract(1, "month").endOf("month"),
  ],
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dates,
  onRangeChange,
  style,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        ...style,
      }}
    >
      <RangePicker
        onChange={(dates: RangePickerProps["value"]) => onRangeChange(dates)}
        value={dates}
        format="YYYY-MM-DD"
        style={{
          padding: "8px",
          borderRadius: "8px",
          width: "100%",
        }}
        allowClear
        maxDate={dayjs()}
        presets={Object.entries(predefinedRanges).map(([label, range]) => ({
          label,
          value: range,
        }))}
        size="small"
      />
    </div>
  );
};

export { getDefaultDates };
export default DateRangePicker; 