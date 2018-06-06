(function ($) {
    const source = new EventSource('/stream');

    source.addEventListener('message', function (e) {
        const votes = JSON.parse(e.data);

        $('#up').text(votes.yes);
        $('#down').text(votes.no);
    }, false)
})(jQuery);