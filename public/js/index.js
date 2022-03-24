const notesApiEndpoint = "/api/notes/";
const filesApiEndpoint = "/api/files/";

var notes = [];

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}

async function reloadNotes() {
    $("#notes-table").html("");
    notes = await $.get(notesApiEndpoint + "get-all");
    if (notes.error) {
        notes = [];
        return;
    }
    notes.forEach(note => {
        var time = new Date(note.timestamp);
        $("#notes-table").append(`
            <tr>
                <th scope="row" class="text-center">${note.id}</th>
                <td class="text-center">${note.value}</td>
                <td class="text-center"><time datetime="${time.toLocaleString()}" title="${time.toLocaleString()}">${timeDifference(Date.now(), note.timestamp)}</time></td>
            </tr>
        `);
    });
}

reloadNotes();
