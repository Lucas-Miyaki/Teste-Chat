function toggleSection(sectionId) {
    const sections = {
        imageGallery: "block",
        uploadFields: "block",
    };

    for (const id in sections) {
        const section = document.getElementById(id);
        if (!section) continue;

        if (id === sectionId) {
            section.style.display = section.style.display === "none" ? sections[id] : "none";
        } else {
            section.style.display = "none";
        }
    }
}

// Figurinhas
function selectSiteImage(url) {
    selectedImageBase64 = url;
    document.getElementById('output').src = url;
}

// Upload Imagens
let selectedImageBase64 = null;

function loadFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const image = document.getElementById('output');

    reader.onload = function(e) {
        selectedImageBase64 = e.target.result;
        image.src = selectedImageBase64;
    };

    if (file) {
        reader.readAsDataURL(file);
    }
};

// Upload Audio
let selectedAudioBase64 = null;

function previewAudio() {
    const file = document.getElementById("audioFile").files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        selectedAudioBase64 = e.target.result;
        document.getElementById("audioPreview").src = selectedAudioBase64;
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}
// Upload Video
let selectedVideoBase64 = null;

function previewVideo() {
    const file = document.getElementById("videoFile").files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        selectedVideoBase64 = e.target.result;
        const video = document.getElementById("videoPreview");
        video.src = selectedVideoBase64;
        video.style.display = "block";
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}
// Upload Arquivo (excel, txt, pdf, zip)
let selectedGenericFile = null;
let selectedGenericFileName = "";

function handleGenericFile() {
    const file = document.getElementById("genericFile").files[0];
    const pdfPreview = document.getElementById("pdfPreview");

    if (!file) return;

    const reader = new FileReader();
    const fileType = file.type;

    reader.onload = function(e) {
        const fileURL = e.target.result;
        selectedGenericFile = e.target.result;
        selectedGenericFileName = file.name;

        const link = document.getElementById("fileLink");
        link.href = selectedGenericFile;
        link.textContent = selectedGenericFileName;
        link.style.display = "inline";

        // Se for PDF, mostrar no iframe
        if (fileType === "application/pdf") {
            pdfPreview.src = fileURL;
            pdfPreview.style.display = "block";
        } else {
            // Caso contrário, exibir link de download
            pdfPreview.style.display = "none";
            fileLink.href = fileURL;
            fileLink.textContent = `Baixar: ${file.name}`;
            fileLink.style.display = "block";
        }
    };

    reader.readAsDataURL(file);
}

// Upload Gif

let selectedGifBase64 = null;

function previewGif() {
    const file = document.getElementById("gifFile").files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        selectedGifBase64 = e.target.result;
        const image = document.getElementById('output');
        image.src = selectedGifBase64;
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}