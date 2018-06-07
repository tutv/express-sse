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
                const {target, loaded} = progressEvent;
                const {responseText} = target;

                const text = (responseText + "").slice(startData);
                const events = text.split(';')
                    .map(response => {
                        return response.trim();
                    })
                    .map(text => {
                        try {
                            return JSON.parse(text);
                        } catch (error) {
                            return null;
                        }
                    })
                    .filter(response => response !== null);

                const voteEvents = events.filter(event => event.type && event.type === 'vote');

                voteEvents.forEach(event => {
                    const {data} = event;

                    $('#up').text(data.yes);
                    $('#down').text(data.no);
                });

                startData = responseText.length || loaded;
            },
        }).then(response => {
            pulling();
        }).catch(error => {
            console.error(error);

            setTimeout(() => {
                pulling();
            }, 1000);
        });
    }

    pulling();
})(jQuery, axios);