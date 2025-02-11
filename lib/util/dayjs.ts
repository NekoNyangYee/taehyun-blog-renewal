import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Seoul");

export const formatDate = (date: Date | string) => {
    return dayjs(date).format("YYYY년 MM월 DD일 HH:mm");
};

export default dayjs;