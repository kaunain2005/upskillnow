import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.upskillnow.app',
  appName: 'upskillnow',
  webDir: 'out',
  server: {
    androidScheme: "https"
  }
};

export default config;
