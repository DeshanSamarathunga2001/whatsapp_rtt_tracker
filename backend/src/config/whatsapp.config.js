module.exports ={
    //ProbinG Setting
    PING_INTERVAL: 2000,    //2 seconds(2Hz) 

    //RTT threshold for activity detection in milliseconds
    RTT_THRESHOLDS :{
        APP_ACTIVE: 500,
        SCREEN_ON: 1000,
        SCREEN_OFF: 2000,
        OFFLINE: 10000
    },

    //Analisis settings
    HISTORY_SIZE: 10,
    MOVING_AVERAGE_WINDOW : 5

     // Device fingerprinting thresholds
    DEVICE_FINGERPRINT: {
        LOW_VARIANCE_THRESHOLD: 100,   // ms² - Desktop/web client
        HIGH_VARIANCE_THRESHOLD: 300,  // ms² - Mobile device
        DESKTOP_RTT_MAX: 500,          // ms - Typical desktop RTT
        MOBILE_RTT_TYPICAL: 1500       // ms - Typical mobile RTT
  },
  

}