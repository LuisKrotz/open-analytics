//const csrfToken = document.getElementById('csrf-token').content;
const sendUrl = 'https://63685736d1d09a8fa623f760.mockapi.io/api/open-analytics/save-data';

function Dataset(name, url, event, value) {
    // SHORT STRING
    this.name = name;

    // SHORT STRING
    this.url = url;

    // SHORT STRING
    this.event = event;

    // SHORT STRING / NUMBER
    this.value = value;
}

async function send(data) {
    try {
        fetch(sendUrl, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                // 'X-CSRF-Token': csrfToken,
            }
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }

            return Promise.reject(response);
        }).then(() => {
            return
        }).catch(() => {
            return
        });
    } catch (e) {
        return
    }
}

(() => {
    window.OA = {
        registerEvent: (name, url, event, value = 1) => {
            send(new Dataset(name, url, event, value));
        },
        init: () => {
            let pathname = window.location.pathname;

            let OaObject = JSON.parse(localStorage.getItem('OaObject'), false),
                OaSessionTime = sessionStorage.getItem('OaSessionTime'),
                href = pathname,
                resolution = document.documentElement.clientWidth,
                browser, userAgent = navigator.userAgent;

            let sessionTimer = Number(OaSessionTime !== undefined && OaSessionTime !== null ? OaSessionTime : 0),
                rejected = 1, // true
                pageTimer = 0;


            setInterval(() => {
                // Set interval to count time spent in the session and current page
                sessionTimer++, pageTimer++;

                sessionStorage.setItem('OaSessionTime', sessionTimer);
            }, 1000);

            setTimeout(() => rejected = false, 5000);

            // PAGEVIEW
            send(new Dataset('page', href, 'page_view', 1));

            // BROWSER LANGUAGE
            send(new Dataset('page', href, 'user_lang', navigator.languages && navigator.languages[0] || // Chrome / Firefox
                navigator.language || // All browsers
                navigator.userLanguage));

            // USER DEVICE
            // The order matters here, and this may report false positives for unlisted browsers.
            if (userAgent.indexOf("Firefox") > -1) {
                browser = "Mozilla Firefox";
            } else if (userAgent.indexOf("SamsungBrowser") > -1) {
                browser = "Samsung Internet";
            } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
                browser = "Opera";
            } else if (userAgent.indexOf("Trident") > -1) {
                browser = "Microsoft Internet Explorer";
            } else if (userAgent.indexOf("Edge") > -1) {
                browser = "Microsoft Edge (Legacy)";
            } else if (userAgent.indexOf("Edg") > -1) {
                browser = "Microsoft Edge (Chromium)";
            } else if (userAgent.indexOf("Chrome") > -1) {
                browser = "Google Chrome or Chromium";
            } else if (userAgent.indexOf("Safari") > -1) {
                browser = "Apple Safari";
            } else {
                browser = "Unknown Browser";
            }

            send(new Dataset(browser, href, 'user_device', resolution >= 640 && resolution <= 1170 ?
                'tablet' : resolution > 1170 ? 'desktop' : 'mobile'));

            // RETURNING VISITOR
            if (OaObject !== undefined && OaObject !== null) {
                send(new Dataset('page', href, 'returning_visitor', 1))
            } else {
                try {
                    localStorage.setItem('OaObject', 1); // true
                } catch (e) {
                    return void(0);
                }
            }


            // GET INFOS FROM IANA TIMEZONE / LOCALE
            // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
            send(new Dataset('page', href, 'IANA_timezone', Intl.DateTimeFormat().resolvedOptions().timeZone));


            // SEND DATA FROM CONTENT REJECTION AND TIMERS
            window.onbeforeunlOad = function () {
                send(new Dataset('page', href, 'total_session_time', sessionTimer)),
                    send(new Dataset('page', href, 'single_page_time', pageTimer));
                send(new Dataset('page', href, 'page_rejected', rejected));
            };
        }
    }
}).call(this);