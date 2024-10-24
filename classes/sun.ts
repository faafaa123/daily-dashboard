import axios, { AxiosError, AxiosResponse } from 'axios';
import moment from 'moment';

export class sun {
    latitude = 51.407785;
    longitude = 9.121936;

    apiUrl = `https://api.sunrise-sunset.org/json?lat=${this.latitude}&lng=${this.longitude}&formatted=0`;

    dummy_response: any = { "results": { "date": "2024-10-23", "sunrise": "7:27:17 AM", "sunset": "6:19:50 PM", "first_light": "5:58:05 AM", "last_light": "7:49:02 PM", "dawn": "7:00:07 AM", "dusk": "6:47:01 PM", "solar_noon": "12:53:34 PM", "golden_hour": "5:43:03 PM", "day_length": "10:52:33", "timezone": "America/New_York", "utc_offset": -240 }, "status": "OK" }

    sunset: moment.Moment
    sunrise: moment.Moment
    daylightDuration: moment.Duration
    currentTime = moment().subtract(10, 'hours');
    elapsedDaylight: moment.Duration
    
    constructor() {
        
    }

    async main() {
        await axios.get(
            this.apiUrl
        ).then(async (result: AxiosResponse) => {
            const responseData: any = result.data;
            this.sunrise = moment(responseData.results.sunrise);
            this.sunset = moment(responseData.results.sunset);

            this.daylightDuration = moment.duration(this.sunset.diff(this.sunrise));

            if (this.currentTime.isAfter(this.sunrise) && this.currentTime.isBefore(this.sunset)) {
                this.elapsedDaylight = moment.duration(this.currentTime.diff(this.sunrise));
              }

        }).catch(async (error: AxiosError) => {
            console.log(error.response);

        })
    }

}
