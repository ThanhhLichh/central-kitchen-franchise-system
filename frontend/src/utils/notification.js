import { getToken, onMessage } from "firebase/messaging";
import { toast } from "react-toastify";
import { messaging } from "../firebase";
import axiosClient from "../api/axios";
import { NOTIFICATION_API } from "../api/config";

const VAPID_KEY =
  "BJa7Q_t834-QtspRpYlMl7rTs7GjyvDxqNHVLUvtPUcTk3kHjaMpspNm77jGFwo61a2stPDyoyD8U2eWgiOgkjs";

export const initNotification = async (userId) => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("User từ chối notification");
      return;
    }

    const fcmToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

    if (!fcmToken) {
      console.log("Không lấy được FCM token");
      return;
    }

    console.log("FCM TOKEN:", fcmToken);

    await axiosClient.post(NOTIFICATION_API.REGISTER_TOKEN, {
      userId,
      fcmToken,
    });

    console.log("Đăng ký FCM token thành công");

    onMessage(messaging, (payload) => {
      console.log("Notification:", payload);

      const title = payload?.notification?.title || "Thông báo mới";
      const body = payload?.notification?.body || "";

      toast.info(`${title}: ${body}`);

      if (Notification.permission === "granted") {
        new Notification(title, { body });
      }
    });
  } catch (err) {
    console.error("Notification error:", err);
  }
};