// 모달 관련 코드
const modal = document.getElementById("uploadModal");
const openModalBtn = document.getElementById("openUploadModal");
const closeModalBtn = document.querySelector(".close-modal");

openModalBtn.onclick = function () {
  modal.style.display = "block";
};

closeModalBtn.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

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

          // 이미지 컨테이너를 클릭 가능하게 만들기
          const imgWrapper = document.createElement("div");
          imgWrapper.className = "preview-image-wrapper";
          imgWrapper.style.cursor = "pointer";

          const img = document.createElement("img");
          img.src = e.target.result;
          img.className = "preview-image";

          // 이미지 클릭 이벤트 추가
          imgWrapper.addEventListener("click", () => {
            const modal = document.getElementById("imageModal");
            const modalImg = document.getElementById("modalImage");
            modalImg.src = e.target.result;
            modal.style.display = "block";

            // 다운로드 버튼 숨기기 (업로드 전이므로)
            document.getElementById("downloadButton").style.display = "none";
          });

          imgWrapper.appendChild(img);
          imageContainer.appendChild(imgWrapper);

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
  .addEventListener("click", async function (e) {
    const submitButton = e.target;

    // 버튼 비활성화 및 로딩 상태 표시
    submitButton.disabled = true;
    submitButton.classList.add("loading");
    submitButton.textContent = "업로드 중...";

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
    // console.log(dateStr);
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

    // console.log(uploadData);
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

        // 업로드 후 초기화
        document.getElementById("imagePreview").innerHTML = "";
        document.querySelector(".common-filter").style.display = "none";
        document.getElementById("submitUpload").style.display = "none";
        modal.style.display = "none";

        // 갤러리 새로고침
        await fetchAndDisplayData();
      } else {
        throw new Error("업로드 실패");
      }
    } catch (error) {
      alert("업로드 중 오류가 발생했습니다: " + error.message);
    } finally {
      // 버튼 상태 복원
      submitButton.disabled = false;
      submitButton.classList.remove("loading");
      submitButton.textContent = "업로드";
    }
  });

// 전역 변수 추가
let galleryData = [];
let currentPage = 1;
const itemsPerPage = 20;
let currentSortOrder = "newest"; // 'newest' 또는 'oldest'
let isLoading = false;

// 정역 변수에 필터링된 데이터를 저장할 변수 추가
let filteredGalleryData = [];

// 정렬 버튼 이벤트 리스너 추가
document.getElementById("sortNewest").addEventListener("click", () => {
  currentSortOrder = "newest";
  currentPage = 1;
  displayGallery(galleryData);
});

document.getElementById("sortOldest").addEventListener("click", () => {
  currentSortOrder = "oldest";
  currentPage = 1;
  displayGallery(galleryData);
});

// 스크롤 이벤트 리스너 추가
window.addEventListener("scroll", () => {
  if (isLoading) return;

  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMoreItems();
  }
});

function loadMoreItems() {
  // filteredGalleryData를 기준으로 페이지네이션 체크
  if (currentPage * itemsPerPage >= filteredGalleryData.length) return;

  currentPage++;
  displayGallery(filteredGalleryData, true);
}

// displayGallery 함수 수정
async function displayGallery(jsonData, isAppending = false) {
  const galleryContainer = document.getElementById("photoGallery");
  if (!isAppending) {
    galleryContainer.innerHTML = "";
    currentPage = 1;
  }

  isLoading = true;

  // 정렬 로직
  const sortedData = jsonData.sort((a, b) => {
    const getDateFromTags = (tags) => {
      const dateTag = tags
        .split(",")
        .find((tag) => tag.trim().match(/^#?\d{4}년\d{2}월\d{2}일$/));
      if (!dateTag) return "";
      return dateTag.replace(/[^0-9]/g, "");
    };

    const dateA = getDateFromTags(a.tags);
    const dateB = getDateFromTags(b.tags);

    if (!dateA || !dateB) {
      const [idDateA, orderA] = a.id.split("_");
      const [idDateB, orderB] = b.id.split("_");
      return currentSortOrder === "newest"
        ? idDateB.localeCompare(idDateA) || parseInt(orderA) - parseInt(orderB)
        : idDateA.localeCompare(idDateB) || parseInt(orderB) - parseInt(orderA);
    }

    return currentSortOrder === "newest"
      ? dateB.localeCompare(dateA)
      : dateA.localeCompare(dateB);
  });

  // 페이지네이션 적용
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const itemsToDisplay = sortedData.slice(startIndex, endIndex);

  for (const item of itemsToDisplay) {
    const card = document.createElement("div");
    card.className = "gallery-card";

    const ratioType = getImageRatioType(item.width, item.height);
    card.classList.add(`gallery-card-${ratioType}`);

    const mediumImg = document.createElement("img");
    mediumImg.src = item.mediumURL;
    mediumImg.alt = "갤러리 이미지";
    mediumImg.className = "gallery-image thumb";
    mediumImg.loading = "lazy";

    const fullImg = document.createElement("img");
    fullImg.src = item.imgURL;
    fullImg.alt = "갤러리 이미지";
    fullImg.className = "gallery-image medium";
    fullImg.loading = "lazy";

    const tagContainer = document.createElement("div");
    tagContainer.className = "gallery-tags";

    const tags = item.tags.split(",");
    tags.forEach((tag) => {
      const tagSpan = document.createElement("span");
      tagSpan.className = "gallery-tag";
      tagSpan.textContent = tag.trim();
      tagContainer.appendChild(tagSpan);
    });

    card.addEventListener("click", () => {
      const modal = document.getElementById("imageModal");
      const modalImg = document.getElementById("modalImage");
      const downloadBtn = document.getElementById("downloadButton");

      modalImg.src = item.imgURL;
      downloadBtn.href = item.imgURL;
      downloadBtn.download = `${item.id}.jpg`; // 다운로드 파일명 설정
      modal.style.display = "block";
    });

    card.appendChild(mediumImg);
    card.appendChild(fullImg);
    card.appendChild(tagContainer);
    galleryContainer.appendChild(card);
  }

  isLoading = false;
}

// fetchAndDisplayData 함수 수정
async function fetchAndDisplayData(retryCount = 3, delay = 1000) {
  for (let i = 0; i < retryCount; i++) {
    try {
      const response = await fetch(submitURL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonString = await response.text();
      galleryData = JSON.parse(jsonString);
      filteredGalleryData = galleryData; // 초기 로드시 전체 데이터로 설정
      await displayGallery(filteredGalleryData);
      return;
    } catch (error) {
      console.error(`시도 ${i + 1}/${retryCount} 실패:`, error);
      if (i === retryCount - 1) {
        console.error("모든 재시도 실패");
        alert("데이터를 불러오는데 실패했습니다. 페이지를 새로고침 해주세요.");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// 검색 기능 수정
function filterGallery(searchText) {
  const gallery = document.getElementById("photoGallery");
  gallery.classList.add("searching");

  setTimeout(() => {
    if (!searchText || searchText.length < 2) {
      filteredGalleryData = galleryData; // 검색어가 없을 때는 전체 데이터 사용
    } else {
      filteredGalleryData = galleryData.filter((item) => {
        const tags = item.tags.toLowerCase();
        return tags.includes(searchText.toLowerCase());
      });
    }

    currentPage = 1;
    displayGallery(filteredGalleryData);
    gallery.classList.remove("searching");
  }, 300);
}

// 검색 입력 이벤트 리스너 추가
const searchInput = document.getElementById("searchInput");
let debounceTimer;

searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    filterGallery(e.target.value);
  }, 300); // 300ms 디바운스
});

function getImageRatioType(width, height) {
  const ratio = width / height;

  if (ratio >= 1.7) {
    return "landscape";
  } else if (ratio <= 0.6) {
    return "portrait";
  } else {
    return "square";
  }
}

// 모달 닫기 기능 추가
const imageModal = document.getElementById("imageModal");
const closeImageModal = document.querySelector(".close-image-modal");

imageModal.addEventListener("click", (e) => {
  if (e.target === imageModal || e.target.classList.contains("modal-content")) {
    imageModal.style.display = "none";
    document.getElementById("downloadButton").style.display = "block";
  }
});

closeImageModal.addEventListener("click", () => {
  imageModal.style.display = "none";
});

//

fetchAndDisplayData();
