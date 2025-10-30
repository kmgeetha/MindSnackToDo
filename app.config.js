import 'dotenv/config';

export default {
  expo: {
    name: "MindSnackTodo",
    slug: "MindSnackTodo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    plugins: [
      "expo-sqlite",
      "expo-web-browser",
    ],
    android: {
      package: "com.mindsnack.todo",
    },
    extra: {
      CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,

      // 👇 Add this EAS project ID block
      eas: {
        projectId: "2a446566-936c-4b7c-bc4b-845aca23b102",
      },
    },
  },
};
