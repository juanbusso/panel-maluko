import { ajax } from "can";

// Funcion para subir a Google Drive
function uploadToDrive(inFile,folderId,callback) {
    return new Promise((resolve,error) => {
    const url = 'https://script.google.com/macros/s/AKfycbzZtE89l4oaUATlDp6rdktQ0ScYdtStR9a16xHKpOFlGzViGQ9z/exec';
    const file = (inFile.files && inFile.files[0]) ||'';
    let params = {};
    inFile.fileIdToDelete && (params.fileIdToDelete = inFile.fileIdToDelete);
    if(file) {
        params.filename = file.name;
        params.contentType = file.type;
        params.folderId = folderId || '13RUWzjwoLfU1st15IuV0hAMCJI8oys3j';

        let fr = new FileReader();
        fr.onload = function(e) {
            params.file = e.target.result.replace(/^.*,/, '');

            ajax({
                crossDomain: true,
                url: url,
                type: "POST",
                data: params
            }).then((r)=> {
                if(callback) callback(r.result !== 'Bad parameters' ? r.result : '');
                resolve(r.result);
            });
        };

        fr.readAsDataURL(file)
    }
    else {
        ajax({
            crossDomain: true,
            url: url,
            type: "POST",
            data: params
        }).then((r)=> {
            if(callback) callback(r.result !== 'Bad parameters' ? r.result : '');
            resolve(r.result);
        });
    }
    }
    )
}

export default uploadToDrive;
