(function ($, axios) {
    function sse() {
        const source = new EventSource('/stream');

        source.addEventListener('message', function (e) {
            const votes = JSON.parse(e.data);

            $('#up').text(votes.yes);
            $('#down').text(votes.no);
        }, false)
    }


    function pulling() {
        let startData = 0;

        axios.get('/pull', {
            // responseType: 'stream',
            onDownloadProgress: function (progressEvent) {
                const target = progressEvent.target;
                const loaded = progressEvent.loaded;

                const responseText = target.responseText;


                const text = (responseText + "").slice(startData);
                const events = text.split(';')
                    .map(function (response) {
                        return response.trim();
                    })
                    .map(function (text) {
                        try {
                            return JSON.parse(text);
                        } catch (error) {
                            return null;
                        }
                    })
                    .filter(function (response) {
                        return response !== null
                    });

                const voteEvents = events.filter(function (event) {
                    return event.type && event.type === 'vote'
                });

                voteEvents.forEach(function (event) {
                    const data = event.data;

                    $('#up').text(data.yes);
                    $('#down').text(data.no);
                });

                startData = responseText.length || loaded;
            },
        }).then(function (response) {
            pulling();
        }).catch(function (error) {
            console.error(error);

            setTimeout(function () {
                pulling();
            }, 1000);
        });
    }

    $(document).ready(function () {
        setTimeout(function () {
            pulling();
        }, 0);
    });
})(jQuery, axios);