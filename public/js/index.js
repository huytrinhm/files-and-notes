const notesApiEndpoint = "/api/notes/";
const filesApiEndpoint = "/api/files/";

var notes = [];
var files = [];

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

function humanFileSize(bytes, si = true, dp = 1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
}

function forceDownload(blob, filename) {
    var a = document.createElement('a');
    a.download = filename;
    a.href = blob;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function fetchAndDownload(url, filename) {
    if (!filename) filename = url.split('\\').pop().split('/').pop();
    fetch(url, {
        headers: new Headers({
            'Origin': location.origin
        }),
        mode: 'cors'
    }).then(response => {
        console.log(response);
        return response.blob();
    }).then(blob => {
        let blobUrl = window.URL.createObjectURL(blob);
        forceDownload(blobUrl, filename);
    }).catch(e => console.error(e));
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
            <tr data-note-id="${note.id}">
                <th scope="row" class="text-center">${note.id}</th>
                <td class="text-center">${note.value}</td>
                <td class="text-center"><time datetime="${time.toLocaleString()}" title="${time.toLocaleString()}" data-toggle="tooltip">${timeDifference(Date.now(), note.timestamp)}</time></td>
                <td class="text-center"><button type="button" class="btn btn-danger btn-delete-note" onclick="deleteNote(this);">Delete</button></td>
            </tr>
        `);
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
}

function deleteNote(btn) {
    if (!$(btn).text().includes("?")) {
        var originalText = $(btn).text();
        $(btn).text(originalText + "?");
        $(btn).removeClass("btn-danger");
        $(btn).addClass("btn-warning");
        setTimeout(() => {
            $(btn).text(originalText);
            $(btn).addClass("btn-danger");
            $(btn).removeClass("btn-warning");
        }, 3000);
        return;
    }

    var noteId = $(btn).parent().parent().data("note-id");
    $.ajax({
        type: "DELETE",
        url: notesApiEndpoint + "delete/" + encodeURIComponent(noteId)
    });
    reloadNotes();
}

function addNote(noteId, noteValue) {
    $.ajax({
        type: "POST",
        url: notesApiEndpoint + "set/" + encodeURIComponent(noteId),
        data: noteValue,
        contentType: 'text/plain'
    });
    reloadNotes();
}

async function reloadFiles() {
    $("#files-table").html("");
    files = await $.get(filesApiEndpoint + "get-all");
    if (files.error) {
        files = [];
        return;
    }
    files.forEach(file => {
        var time = new Date(file.timestamp);
        $("#files-table").append(`
            <tr data-file-name="${file.name}">
                <th scope="row" class="text-center"><a class="file-name" onclick="downloadFile(this);">${file.name}</a></th>
                <td class="text-center"><time datetime="${time.toLocaleString()}" title="${time.toLocaleString()}" data-toggle="tooltip">${timeDifference(Date.now(), time)}</time></td>
                <td class="text-center">${humanFileSize(file.size)}</td>
                <td class="text-center"><button type="button" class="btn btn-danger btn-delete-file" onclick="deleteFile(this);">Delete</button></td>
            </tr>
        `);
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
}

function deleteFile(btn) {
    if (!$(btn).text().includes("?")) {
        var originalText = $(btn).text();
        $(btn).text(originalText + "?");
        $(btn).removeClass("btn-danger");
        $(btn).addClass("btn-warning");
        setTimeout(() => {
            $(btn).text(originalText);
            $(btn).addClass("btn-danger");
            $(btn).removeClass("btn-warning");
        }, 3000);
        return;
    }

    var fileId = $(btn).parent().parent().data("file-name");
    $.ajax({
        type: "DELETE",
        url: filesApiEndpoint + "delete/" + encodeURIComponent(fileId)
    });
    reloadFiles();
}

async function downloadFile(a) {
    var fileName = $(a).parent().parent().data("file-name");
    if (!$(a).data("download-url")) {
        $(a).data("download-url", (await $.get(filesApiEndpoint + "get/" + encodeURIComponent(fileName))).url);
    }
    fetchAndDownload($(a).data("download-url"), fileName);
}

function uploadFile(fileId, file) {
    const form = new FormData();
    form.append("file", file);

    const settings = {
        "async": true,
        "crossDomain": false,
        "url": filesApiEndpoint + "set/" + encodeURIComponent(fileId),
        "method": "POST",
        "headers": {},
        "processData": false,
        "contentType": false,
        "mimeType": "multipart/form-data",
        "data": form
    };

    $.ajax(settings).done(function (response) {
        reloadFiles();
    });
}

reloadNotes();

$(".btn-save-note").on("click", () => {
    var noteId = $("#add-note-id").val();
    var noteValue = $("#add-note-value").val();
    addNote(noteId, noteValue);
});

$(".btn-save-file").on("click", () => {
    var fileId = $("#upload-file-id").val();
    var file = $("#upload-file-value").prop("files")[0];
    uploadFile(fileId, file);
});

$("#nav-notes-tab").on("click", reloadNotes);
$("#nav-files-tab").on("click", reloadFiles);
