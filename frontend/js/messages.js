const createMessageSelfElement = (content, image, gif, audio, video, file, fileName, timestamp, privateTo) => {
    
    const div = document.createElement("div");
    div.classList.add("message--self");
    div.classList.add("message");

    const time = document.createElement("span");
    time.classList.add("message--timestamp");
    time.textContent = timestamp;
    time.style.display = "block";
    time.style.fontSize = "0.8em";
    time.style.color = "#888";

    if (privateTo && privateTo !== null) {
        content = `<strong>[Privado para ${selectedPrivateRecipient.name}]</strong> ` + content;
        div.classList.add("private-message");
    }

    div.innerHTML = content;
    

    if (image) {
        const img = document.createElement("img");
        img.src = image;
        img.style.maxWidth = "200px";
        img.style.display = "block";
        img.style.marginTop = "10px";
        div.appendChild(img);
    }

    if (gif) {
        const gifElement = document.createElement("img");
        gifElement.src = gif;
        gifElement.style.maxWidth = "200px";
        gifElement.style.display = "block";
        gifElement.style.marginTop = "10px";
        div.appendChild(gifElement);
    }

    if (audio) {
        const audioElem = document.createElement("audio");
        audioElem.src = audio;
        audioElem.controls = true;
        audioElem.style.display = "block";
        audioElem.style.marginTop = "10px";
        div.appendChild(audioElem);
    }

    if (video) {
        const videoElem = document.createElement("video");
        videoElem.src = video;
        videoElem.controls = true;
        videoElem.style.display = "block";
        videoElem.style.marginTop = "10px";
        videoElem.style.maxWidth = "200px";
        div.appendChild(videoElem);
    }

    if (file && fileName) {
        const fileLink = document.createElement("a");
        fileLink.href = file;
        fileLink.textContent = fileName;
        fileLink.target = "_blank";
        fileLink.style.display = "block";
        fileLink.style.marginTop = "10px";
        div.appendChild(fileLink);
    }
    div.appendChild(time);
    if (typeof aplicarEstiloMensagens === "function") {
        aplicarEstiloMensagens([div]);
    }
    return div;
};

const createMessageOtherElement = (content, sender, senderColor, image, gif, audio, video, file, fileName, timestamp, privateTo) => {
    const div = document.createElement("div");
    const span = document.createElement("span");

    const time = document.createElement("span");
    time.classList.add("message--timestamp");
    time.textContent = timestamp;
    time.style.display = "block";
    time.style.fontSize = "0.8em";
    time.style.color = "#888";

    div.classList.add("message--other");
    div.classList.add("message");
    span.classList.add("message--sender");
    span.style.color = senderColor;
    span.textContent = sender;

    if (privateTo && privateTo !== null) {
        content = `<strong>[Privado de ${sender}]</strong> ` + content;
        div.classList.add("private-message");
    }


    div.appendChild(span);

    const contentDiv = document.createElement("div");
    contentDiv.innerHTML = content;
    div.appendChild(contentDiv);

    if (image) {
        const img = document.createElement("img");
        img.src = image;
        img.style.maxWidth = "200px";
        img.style.display = "block";
        img.style.marginTop = "10px";
        div.appendChild(img);
    }

    if (gif) {
        const gifElement = document.createElement("img");
        gifElement.src = gif;
        gifElement.style.maxWidth = "200px";
        gifElement.style.display = "block";
        gifElement.style.marginTop = "10px";
        div.appendChild(gifElement);
    }

    if (audio) {
        const audioElem = document.createElement("audio");
        audioElem.src = audio;
        audioElem.controls = true;
        audioElem.style.display = "block";
        audioElem.style.marginTop = "10px";
        div.appendChild(audioElem);
    }

    if (video) {
        const videoElem = document.createElement("video");
        videoElem.src = video;
        videoElem.controls = true;
        videoElem.style.display = "block";
        videoElem.style.marginTop = "10px";
        videoElem.style.maxWidth = "200px";
        div.appendChild(videoElem);
    }

    if (file && fileName) {
        const fileLink = document.createElement("a");
        fileLink.href = file;
        fileLink.textContent = fileName;
        fileLink.target = "_blank";
        fileLink.style.display = "block";
        fileLink.style.marginTop = "10px";
        div.appendChild(fileLink);
    }
    div.appendChild(time);

    if (typeof aplicarEstiloMensagens === "function") {
        aplicarEstiloMensagens([div]);
    }
    
    return div;
};

export {createMessageSelfElement, createMessageOtherElement};