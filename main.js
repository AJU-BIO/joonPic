// submitURL 정의
const submitURL =
  "https://script.google.com/macros/s/AKfycbypqHqbQoWmGuv0OCDg3TJTd4J93vs_kG9RR28QhLAiAL-SUsPh84_sAlLfmnQ5F5Nfvg/exec";

document
  .getElementById("imageUpload")
  .addEventListener("change", function (event) {
    // 파일이 선택되면 common-filter와 제출 버튼 표시
    document.querySelector(".common-filter").style.display = "flex";
    document.getElementById("submitUpload").style.display = "block";

    const previewContainer = document.getElementById("imagePreview");
    previewContainer.innerHTML = ""; // 기존 미리보기 초기화

    const files = event.target.files;
    for (let file of files) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onload = function (e) {
          // 이미지와 태그를 감싸는 컨테이너
          const imageContainer = document.createElement("div");
          imageContainer.className = "image-tag-container";

          // 이미지 요소
          const img = document.createElement("img");
          img.src = e.target.result;
          img.className = "preview-image";

          // 태그 입력 영역 컨테이너
          const tagArea = document.createElement("div");
          tagArea.className = "tag-area";

          // 태그 입력 필드와 버튼을 감싸는 div
          const inputWrapper = document.createElement("div");
          inputWrapper.className = "input-wrapper";

          // 태그 입력 필드
          const tagInput = document.createElement("input");
          tagInput.type = "text";
          tagInput.className = "tag-input";
          tagInput.placeholder = "태그를 입력하세요";

          // 컨가 버튼
          const addButton = document.createElement("button");
          addButton.className = "add-tag-button";
          addButton.textContent = "Add";

          // 태그들을 보여주는 컨테이너
          const tagsContainer = document.createElement("div");
          tagsContainer.className = "tags-container";

          // 현재 날짜로 기본 태그 생성
          const today = new Date();
          const dateTag = `#${today.getFullYear()}년${(today.getMonth() + 1)
            .toString()
            .padStart(2, "0")}월${today
            .getDate()
            .toString()
            .padStart(2, "0")}일`;
          addTag(dateTag, tagsContainer);

          // 태그 추가 함수
          function addTag(text, container) {
            if (text.trim() !== "") {
              const tag = document.createElement("span");
              tag.className = "tag";
              tag.textContent = text.startsWith("#") ? text : "#" + text;

              // 태그 클릭 시 삭제
              tag.addEventListener("click", () => {
                container.removeChild(tag);
              });

              container.appendChild(tag);
            }
          }

          // 엔터키 이벤트
          tagInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
              addTag(tagInput.value, tagsContainer);
              tagInput.value = "";
            }
          });

          // 추가 버튼 클릭 이벤트
          addButton.addEventListener("click", () => {
            addTag(tagInput.value, tagsContainer);
            tagInput.value = "";
          });

          // 요소들 조립
          inputWrapper.appendChild(tagInput);
          inputWrapper.appendChild(addButton);
          tagArea.appendChild(inputWrapper);
          tagArea.appendChild(tagsContainer);

          imageContainer.appendChild(img);
          imageContainer.appendChild(tagArea);
          previewContainer.appendChild(imageContainer);
        };

        reader.readAsDataURL(file);
      }
    }
  });

// 공통 태그 추가 기능
document.getElementById("addCommonTag").addEventListener("click", function () {
  const commonTagInput = document.getElementById("commonTagInput");
  const tagText = commonTagInput.value.trim();

  if (tagText !== "") {
    // 모든 태그 컨테이너를 찾아서 태그 추가
    const allTagsContainers = document.querySelectorAll(".tags-container");
    allTagsContainers.forEach((container) => {
      // 중복 태그 확인
      const existingTags = Array.from(container.children).map(
        (tag) => tag.textContent
      );
      const newTagText = tagText.startsWith("#") ? tagText : "#" + tagText;

      if (!existingTags.includes(newTagText)) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = newTagText;

        // 태그 클릭 시 삭제
        tag.addEventListener("click", () => {
          container.removeChild(tag);
        });

        container.appendChild(tag);
      }
    });

    // 입력창 초기화
    commonTagInput.value = "";
  }
});

// 공통 태그 엔터키 이벤트
document
  .getElementById("commonTagInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.getElementById("addCommonTag").click();
    }
  });

// 제출 버튼 이벤트 리스너
document
  .getElementById("submitUpload")
  .addEventListener("click", async function () {
    const imageContainers = document.querySelectorAll(".image-tag-container");
    const uploadData = [];
    let counter = 1;

    // 현재 날짜로 파일명 생성을 위한 날짜 문자열
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(
      today.getMonth() + 1
    ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}${String(
      today.getHours()
    ).padStart(2, "0")}${String(today.getMinutes()).padStart(2, "0")}${String(
      today.getSeconds()
    ).padStart(2, "0")}${String(today.getMilliseconds()).padStart(3, "0")}`;
    console.log(dateStr);
    for (const container of imageContainers) {
      // 이미지의 base64 데이터 추출
      const img = container.querySelector(".preview-image");
      const base64Data = img.src.split(",")[1]; // base64 데이터 부분만 추출

      // 태그 추출 (# 제거)
      const tags = Array.from(container.querySelectorAll(".tag")).map((tag) =>
        tag.textContent.replace("#", "")
      );

      // 데이터 객체 생성
      uploadData.push({
        fileName: `${dateStr}_${counter}`,
        fileBase64: base64Data,
        tags: tags,
      });

      counter++;
    }

    console.log(uploadData);
    const payload = JSON.stringify({
      type: "add",
      data: uploadData,
    });

    try {
      const response = await fetch(submitURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: payload,
      });

      if (response.ok) {
        const responseText = await response.text();
        alert(responseText || "업로드가 완료되었습니다!");
        // 업로드 후 페이지 초기화
        document.getElementById("imagePreview").innerHTML = "";
        document.querySelector(".common-filter").style.display = "none";
        document.getElementById("submitUpload").style.display = "none";
      } else {
        throw new Error("업로드 실패");
      }
    } catch (error) {
      alert("업로드 중 오류가 발생했습니다: " + error.message);
    }
  });
