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
    $('#createEntry form').submit(createEntry);
    $('#createTeacher form').submit(createTeacher);
    $('#createExam form').submit(createExam);
    $('#editEntry form').submit(updateEntry);
	
    $('#home li a').click(function(e){
        var dayOffset = parseInt(this.id);
        var date = new Date();
        date.setDate(date.getDate() + dayOffset - 3);
		var month = parseInt(date.getMonth() + 1);
        sessionStorage.currentDate =  date.getDate() + '.' + month + '.' + date.getFullYear();
        refreshEntries();
    });
	
	$('#teachers_nav').click(function(e){
        refreshTeachers();
    });
	
	$('#exams li a').click(function(e){
		var dayOffset2 = parseInt(this.id);
        var date = new Date();
        date.setDate(date.getDate() + dayOffset2);
		var month = parseInt(date.getMonth() + 1);
        sessionStorage.currentDate2 =  date.getDate() + '.' + month + '.' + date.getFullYear();
        refreshExams();
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
			  transaction.executeSql('CREATE TABLE IF NOT EXISTS teachers (id unique, name TEXT, middlename TEXT, tel TEXT, object TEXT)');
			  transaction.executeSql('CREATE TABLE IF NOT EXISTS exams (date DATE, id TEXT, examcab TEXT, examdate TEXT)');
        }
    );
	
	

});

function createExam() {
    insertExam();
    return false;
}

function insertExam() {
   var date = sessionStorage.currentDate2;
    var id = $('#examname').val();
    var examcab = $('#examcab').val();
    var examdate = $('#examdate').val();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO exams (date, id, examcab, examdate) VALUES (?, ?, ?, ?);', 
                [date, id, examcab, examdate], 
                function(){
                    refreshExams();
                    jQT.goBack();
                }, 
                errorHandler
            );
        }
    );
}

function refreshExams() {
    var current = sessionStorage.currentDate2;
    $('#exam ul li:gt(0)').remove();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM exams WHERE date =? ORDER BY id;', 
                [current], 
               function (transaction, result) {
                    for (var i=0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);					
                        var newEntryRow = $('#examsTemplate').clone();
                        newEntryRow.removeAttr('id');
                        newEntryRow.removeAttr('style');
                        newEntryRow.data('entryId', row.id);
                        newEntryRow.appendTo('#exam ul');
                        newEntryRow.find('.examname').text(row.id);
                        newEntryRow.find('.examcab').text(row.examcab);
                        newEntryRow.find('.examdate').text(row.examdate);
					    newEntryRow.find('.delete').click(function(e){
                            var clickedEntry = $(this).parent();
                            var clickedEntryId = clickedEntry.data('entryId');
                            deleteEntryById3(clickedEntryId);
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

function createTeacher() {
    insertTeacher();
    return false;
}

function insertTeacher() {
    var id = $('#name').val();
    var name = $('#surname').val();
    var middlename = $('#middlename').val();
    var object = $('#object').val();
    var tel = $('#tel').val();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO teachers (id, name, middlename, tel, object) VALUES (?, ?, ?, ?, ?);', 
                [id, name, middlename, tel, object], 
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
                'SELECT * FROM teachers ORDER BY id;', 
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
                        newEntryRow.find('.middlename').text(row.middlename);
                        newEntryRow.find('.tel').text(row.tel);
                        newEntryRow.find('.object').text(row.object);
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
            transaction.executeSql('DELETE FROM teachers WHERE id=?;', [id], null, errorHandler);
        }
    );
}

function deleteEntryById3(id) {
    db.transaction(
        function(transaction) {
            transaction.executeSql('DELETE FROM exams WHERE id=?;', [id], null, errorHandler);
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
