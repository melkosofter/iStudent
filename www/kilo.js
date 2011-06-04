var jQT = $.jQTouch({
    formSelector: false,
    icon: 'icon.png',
    startupScreen: 'Default.png',
    statusBar: 'black', 
    useFastTouch: false,
    preloadImages: [
        'img/apple/img/backButton.png',
        'img/apple/img/grayButton.png',
        'img/apple/img/whiteButton.png',
        'img/apple/img/chevron.png',
        'img/apple/img/loading.gif',
        'img/icons/calendar.png',
        'img/icons/teachers.png',
        'img/icons/exams.png',
        'img/icons/calendar_a.png',
        'img/icons/teachers_a.png',
        'img/icons/exams_a.png'
    ],
	slideSelector: '.slide'
});
var db;
var db2;
$(document).ready(function(){
    if (typeof(PhoneGap) != 'undefined') {
        $('body > *').css({minHeight: '460px !important'});
    }
    // $('#about, #createEntry, #dates, #home, #settings').bind('touchmove', function(e){e.preventDefault()});
    $('#createEntry form').submit(createEntry);
    $('#createTeacher form').submit(createTeacher);
    $('#editEntry form').submit(updateEntry);
/*
    $('#date').bind('pageAnimationEnd', function(e, info){
        if (info.direction == 'in') {
            startWatchingShake();
        }
    });
    $('#date').bind('pageAnimationStart', function(e, info){
        if (info.direction == 'out') {
            stopWatchingShake();
        }
    });
*/
	
    $('#home li a').click(function(e){
        var dayOffset = parseInt(this.id);
        var date = new Date();
        date.setDate(date.getDate() + dayOffset - 3);
		var month = parseInt(date.getMonth() + 1);
        //sessionStorage.currentDate = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear();
        sessionStorage.currentDate =  date.getDate() + '.' + month + '.' + date.getFullYear();
        refreshEntries();
    });
	
	$('#teachers_nav').click(function(e){
        refreshTeachers();
    });

    var shortName = 'istudent';
    var version = '1.0';
    var displayName = 'istudent';
    var maxSize = 65536;
    db = openDatabase(shortName, version, displayName, maxSize);
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'CREATE TABLE IF NOT EXISTS entries (' +
                'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' + 
                'date DATE, subj TEXT, cabinet TEXT, number INTEGER);'
            );
			  transaction.executeSql('CREATE TABLE IF NOT EXISTS entries2 (id unique, name TEXT)');
        }
    );
	
	

});
/*
function loadSettings() {
    $('#age').val(localStorage.age);
    $('#budget').val(localStorage.budget);
    $('#weight').val(localStorage.weight);
}
function saveSettings() {
    localStorage.age = $('#age').val();
    localStorage.budget = $('#budget').val();
    localStorage.weight = $('#weight').val();
    jQT.goBack();
    return false;
}
*/


function createTeacher() {
    insertTeacher();
    return false;
}

function insertTeacher() {
    var id = $('#name').val();
    var name = $('#surname').val();
    var tel = $('#tel').val();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO entries2 (id, name) VALUES (?, ?);', 
                [id, name], 
                function(){
                    refreshTeachers();
                    jQT.goBack();
                }, 
                errorHandler
            );
        }
    );
}

function refreshTeachers() {
    $('#teachers ul li:gt(0)').remove();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM entries2 ORDER BY id;', 
                [], 
                function (transaction, results) {
                    var len = results.rows.length, i;

					for (i = 0; i < len; i++){
                        var row = results.rows.item(i);						
                        var newEntryRow = $('#teachersTemplate').clone();
                        newEntryRow.removeAttr('id');
                        newEntryRow.removeAttr('style');
                        newEntryRow.data('entryId', row.id);
                        newEntryRow.appendTo('#teachers ul');
                        newEntryRow.find('.name').text(row.name);
                        newEntryRow.find('.id').text(row.id);
					    newEntryRow.find('.delete').click(function(e){
                            var clickedEntry = $(this).parent();
                            var clickedEntryId = clickedEntry.data('entryId');
                            deleteEntryById2(clickedEntryId);
                            clickedEntry.slideUp();
                            e.stopPropagation();
                        });
						
                        newEntryRow.click(entryClickHandler);
                    }
                }, 
                errorHandler
            );
        }
    );
}

function createEntry() {
    insertEntry();
    return false;
}

function insertEntry() {
    var date = sessionStorage.currentDate;
    var cabinet = $('#cabinet').val();
    var subj = $('#subj').val();
    var number = $('#number').val();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO entries (date, cabinet, subj, number) VALUES (?, ?, ?, ?);', 
                [date, cabinet, subj, number], 
                function(){
                    refreshEntries();
                    jQT.goBack();
                }, 
                errorHandler
            );
        }
    );
}
function refreshEntries() {
    var currentDate = sessionStorage.currentDate;
    $('#date h1').text(currentDate);
    $('#date ul li:gt(0)').remove();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM entries WHERE date = ? ORDER BY number;', 
                [currentDate], 
                function (transaction, result) {
                    for (var i=0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);						
                        var newEntryRow = $('#entryTemplate').clone();
                        newEntryRow.removeAttr('id');
                        newEntryRow.removeAttr('style');
                        newEntryRow.data('entryId', row.id);
                        newEntryRow.appendTo('#date ul');
                        newEntryRow.find('.subject').text(row.subj);
                        newEntryRow.find('.cabinet').text(row.cabinet);
                        newEntryRow.find('.number').text(row.number);
                        newEntryRow.find('.delete').click(function(e){
                            var clickedEntry = $(this).parent();
                            var clickedEntryId = clickedEntry.data('entryId');
                            deleteEntryById(clickedEntryId);
                            clickedEntry.slideUp();
                            e.stopPropagation();
                        });
						
                        newEntryRow.click(entryClickHandler);
                    }
                }, 
                errorHandler
            );
        }
    );
}
function deleteEntryById(id) {
    db.transaction(
        function(transaction) {
            transaction.executeSql('DELETE FROM entries WHERE id=?;', [id], null, errorHandler);
        }
    );
}

function deleteEntryById2(id) {
    db.transaction(
        function(transaction) {
            transaction.executeSql('DELETE FROM entries2 WHERE id=?;', [id], null, errorHandler);
        }
    );
}
function errorHandler(transaction, error) {
    var message = 'Oops. Error was: "'+error.message+'" (Code '+error.code+')';
    try {
        navigator.notification.alert(message, 'Error', 'Dang!');
    } catch(e) {
        alert(message);
    }
    return true;
}


function updateEntry() {
    var date = sessionStorage.currentDate;
    var cabinet = $('#editEntry input[name="cabinet"]').val();
    var subj = $('#editEntry input[name="subj"]').val();
    var number = $('#editEntry input[name="number"]').val();
    var id = sessionStorage.entryId;
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'UPDATE entries SET date=?, cabinet=?, subj=?, number=? WHERE id=?;', 
                [date, cabinet, subj, number, id], 
                function(){
                    refreshEntries();
                    jQT.goBack();
                }, 
                errorHandler
            );
        }
    );
    return false;
}

function entryClickHandler(e){
    sessionStorage.entryId = $(this).data('entryId');
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM entries WHERE id = ?;', 
                [sessionStorage.entryId], 
                function (transaction, result) {
                    var row = result.rows.item(0);
                    var subj = row.subj;
                    var cabinet = row.cabinet;
                    var number = row.number;

                    $('#editEntry input[name="subj"]').val(subj);
                    $('#editEntry input[name="cabinet"]').val(cabinet);
                    $('#editEntry input[name="number"]').val(number);

                    $('#saveChanges').click(function(){
                         alert('submitted');
                        // $('#editEntry form').submit();
                        updateEntry();
                    });
                    jQT.goTo('#editEntry', 'slideup');
                }, 
                errorHandler
            );
        }
    );
}
function dupeEntryById(entryId) {
    console.log('dupeEntryById called with id: ' + entryId);
    if (entryId == undefined) {
        console.log('You have to have at least one entry in the list to shake out a dupe.');
    } else {
        db.transaction(
            function(transaction) {
                transaction.executeSql(
                    'INSERT INTO entries (date, subj, cabinet, number) SELECT date, subj, cabinet, number FROM entries WHERE id = ?;', 
                    [entryId], 
                    function () {
                        console.log('Success called.');
                        refreshEntries();
                    }, 
                    errorHandler
                );
            }
        );
    }
}
function startWatchingShake() {
    try {
        debug.log('startWatchingShake called');
        var success = function(coords){
            var max = 2;
            if (Math.abs(coords.x) > max || Math.abs(coords.y) > max || Math.abs(coords.z) > max) {
                debug.log('dupe called');
                var entryId = $('#date ul li:last').data('entryId');
                dupeEntryById(entryId);
            }
        };
        var error = function(){};
        var options = {};
        options.frequency = 100;
        sessionStorage.watchId = navigator.accelerometer.watchAcceleration(success, error, options);
    } catch(e) {
        console.log('Catch called in startWatchingShake');
    }
}
function stopWatchingShake() {
    try {
        debug.log('stopWatchingShake called');
        navigator.accelerometer.clearWatch(sessionStorage.watchId);
    } catch(e) {
        console.log('Catch called in stopWatchingShake');
    }
}
