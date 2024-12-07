import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            "/cgi-bin": "https://api.weixin.qq.com"
        }
    }
});
