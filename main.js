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

// addTag 함수 정의
function addTag(text, container) {
  if (!text.trim()) return;

  const tagText = text.trim().startsWith("#") ? text.trim() : "#" + text.trim();

  // 중복 태그 확인
  const existingTags = Array.from(container.children).map(
    (tag) => tag.textContent
  );
  if (existingTags.includes(tagText)) return;

  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = tagText;

  // 태그 클릭 시 삭제
  tag.addEventListener("click", () => {
    container.removeChild(tag);
  });

  container.appendChild(tag);
}

document
  .getElementById("imageUpload")
  .addEventListener("change", function (event) {
    // 디버깅을 위한 콘솔 로그 추가
    console.log("File input change event triggered");

    const previewContainer = document.getElementById("imagePreview");

    // previewContainer가 존재하는지 확인
    if (!previewContainer) {
      console.error("imagePreview element not found!");
      return;
    }

    // 파일이 선택되면 common-filter와 제출 버튼 표시
    document.querySelector(".common-filter").style.display = "flex";
    document.getElementById("submitUpload").style.display = "block";

    previewContainer.innerHTML = ""; // 기존 미리보기 초기화

    const files = event.target.files;
    console.log("Selected files:", files.length);

    for (let file of files) {
      if (file.type.startsWith("image/")) {
        console.log("Processing image file:", file.name);
        const reader = new FileReader();

        reader.onload = function (e) {
          console.log("FileReader loaded successfully");
          const imageContainer = document.createElement("div");
          imageContainer.className = "image-tag-container";

          // 이미지 미리보기
          const previewImg = document.createElement("img");
          previewImg.src = e.target.result;
          previewImg.className = "preview-image";

          // 태그 입력 필드와 버튼을 감싸는 div
          const inputWrapper = document.createElement("div");
          inputWrapper.className = "input-wrapper";

          // 태그 입력 필드
          const tagInput = document.createElement("input");
          tagInput.type = "text";
          tagInput.className = "tag-input";
          tagInput.placeholder = "태그를 입력하세요";

          // 태그 추가 버튼
          const addButton = document.createElement("button");
          addButton.className = "add-tag-button";
          addButton.textContent = "Add";

          // 태그 컨테이너
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

          // 태그 추가 이벤트
          addButton.addEventListener("click", () => {
            addTag(tagInput.value, tagsContainer);
            tagInput.value = "";
          });

          // 엔터키 이벤트
          tagInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
              addTag(tagInput.value, tagsContainer);
              tagInput.value = "";
            }
          });

          // 요소들 조립
          inputWrapper.appendChild(tagInput);
          inputWrapper.appendChild(addButton);
          imageContainer.appendChild(previewImg);
          imageContainer.appendChild(inputWrapper);
          imageContainer.appendChild(tagsContainer);

          // 이미지 클릭 이벤트
          previewImg.addEventListener("click", () => {
            const modal = document.getElementById("imageModal");
            const modalImg = document.getElementById("modalImage");
            modalImg.src = e.target.result;
            modal.style.display = "block";
            document.getElementById("downloadButton").style.display = "none";
          });

          previewContainer.appendChild(imageContainer);
          console.log("Image container added to preview");
        };

        reader.onerror = function (error) {
          console.error("FileReader error:", error);
        };

        reader.readAsDataURL(file);
      }
    }
  });

// 공통 태그 추가 기능
document.querySelector(".common-filter").innerHTML = `
  <div class="common-tag-section">
    <input type="text" id="commonTagInput" class="tag-input" placeholder="공통 태그 입력">
    <button id="addCommonTag" class="common-button">
      <i class="fas fa-tags"></i> 일괄 태그 추가
    </button>
  </div>
  <div class="date-modifier">
    <input type="date" id="commonDateInput" class="date-input">
    <button id="updateCommonDate" class="common-button">
      <i class="fas fa-calendar-alt"></i> 일괄 날짜 수정
    </button>
  </div>
`;

// innerHTML로 요소를 새로 생성한 후에 이벤트 리스너를 다시 바인딩
document.getElementById("addCommonTag").addEventListener("click", function () {
  console.log("일괄 태그 추가 버튼 클릭됨");
  const commonTagInput = document.getElementById("commonTagInput");
  const tagText = commonTagInput.value.trim();

  if (tagText !== "") {
    const allTagsContainers = document.querySelectorAll(".tags-container");
    console.log("찾은 태그 컨테이너:", allTagsContainers.length);

    allTagsContainers.forEach((container) => {
      addTag(tagText, container);
    });

    commonTagInput.value = "";
  }
});

// 공통 태그 엔터키 이벤트도 다시 바인딩
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
    // 제출 버튼 비활성화 및 로딩 상태 표시
    const submitButton = e.target;
    submitButton.disabled = true;
    submitButton.classList.add("loading");

    // 상태 로그 UI 생성
    const statusContainer = document.createElement("div");
    statusContainer.className = "upload-status-container";
    statusContainer.innerHTML = `
      <div class="upload-progress-container">
        <div class="progress-bar">
          <div class="progress"></div>
        </div>
        <div class="progress-text">0/0 업로드 완료</div>
      </div>
      <div class="status-log" style="margin-top: 10px; max-height: 200px; overflow-y: auto; font-size: 14px;"></div>
    `;
    submitButton.parentElement.appendChild(statusContainer);

    const progressBar = statusContainer.querySelector(".progress");
    const progressText = statusContainer.querySelector(".progress-text");
    const statusLog = statusContainer.querySelector(".status-log");

    // 상태 업데이트 함수
    const updateStatus = (message, isError = false) => {
      const logEntry = document.createElement("div");
      logEntry.style.color = isError ? "#ff4444" : "#666";
      logEntry.style.marginBottom = "4px";
      logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
      statusLog.appendChild(logEntry);
      statusLog.scrollTop = statusLog.scrollHeight;
      console.log(isError ? `Error: ${message}` : message);
    };

    // 업로드할 이미지 컨테이너들 수집
    const imageContainers = document.querySelectorAll(".image-tag-container");
    const totalImages = imageContainers.length;
    let uploadSuccessCount = 0;

    // 현일명 생성을 위한 타임스탬프 (YYYYMMDDHHmmssSSS 형식)
    const dateStr = new Date()
      .toISOString()
      .replace(/[-:\.]/g, "")
      .slice(0, -4);

    // 모든 업로드 요청을 Promise 배열로 생성
    const uploadPromises = Array.from(imageContainers).map(
      async (container, i) => {
        await new Promise((resolve) => setTimeout(resolve, i * 500));

        try {
          const img = container.querySelector(".preview-image");
          updateStatus(`이미지 ${i + 1} 리사이징 중...`);

          const resizedImage = await resizeImage(img.src, 5472);
          const base64Data = resizedImage.split(",")[1];

          const tags = Array.from(container.querySelectorAll(".tag")).map(
            (tag) => tag.textContent.replace("#", "")
          );

          const currentFileName = `${dateStr}_${i + 1}`;
          updateStatus(`이미지 ${i + 1} 업로드 준비 완료`);

          const singlePayload = JSON.stringify({
            type: "add",
            data: [
              {
                fileName: currentFileName,
                fileBase64: base64Data,
                tags: tags,
              },
            ],
          });

          // 재시도 로직
          for (let retry = 0; retry < 3; retry++) {
            try {
              updateStatus(`이미지 ${i + 1} 업로드 시도 ${retry + 1}/3...`);

              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 90000); // 90초로 증가

              const response = await fetch(submitURL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: singlePayload,
                signal: controller.signal,
              });

              clearTimeout(timeoutId);
              const result = await response.text();

              if (!response.ok) {
                throw new Error(`서버 응답 오류: ${response.status}`);
              }

              // 응답 검증 강화
              if (!result || result === "업로드실패") {
                throw new Error("서버에서 업로드 실패 응답");
              }

              if (!result.includes(currentFileName)) {
                throw new Error("파일명 불일치: 서버 응답 확인 필요");
              }

              updateStatus(`이미지 ${i + 1} 업로드 성공!`);
              updateStatus(result); // 서버 응답 로그에 표시
              container.style.opacity = "0.5";
              return true;
            } catch (error) {
              const errorMessage =
                error.name === "AbortError"
                  ? "타임아웃 (90초 초과)"
                  : error.message;

              updateStatus(`이미지 ${i + 1} 실패: ${errorMessage}`, true);

              if (retry === 2) {
                updateStatus(
                  `이미지 ${i + 1} 최종 실패 - 다시 시도해주세요`,
                  true
                );
                return false;
              }

              const waitTime = (retry + 1) * 3000; // 재시도마다 대기 시간 증가
              updateStatus(`이미지 ${i + 1} ${waitTime / 1000}초 후 재시도...`);
              await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
          }
        } catch (error) {
          updateStatus(`이미지 ${i + 1} 처리 중 오류: ${error.message}`, true);
          return false;
        }
        return false;
      }
    );

    // 전체 업로드 완료 후 처리
    const results = await Promise.all(uploadPromises);
    const finalSuccessCount = results.filter(Boolean).length;

    if (finalSuccessCount > 0) {
      updateStatus(`총 ${finalSuccessCount}개의 이미지 업로드 완료!`);
      alert(`${finalSuccessCount}개의 이미지가 업로드되었습니다.`);
      // UI 초기화
      document.getElementById("imagePreview").innerHTML = "";
      document.querySelector(".common-filter").style.display = "none";
      document.getElementById("submitUpload").style.display = "none";
      modal.style.display = "none";
      await fetchAndDisplayData();
    } else {
      updateStatus("모든 이미지 업로드 실패");
      alert("업로드에 실패했습니다.");
    }

    // 제출 버튼 상태 복원
    submitButton.disabled = false;
    submitButton.classList.remove("loading");
    submitButton.textContent = "업로드";
    statusContainer.remove();
  });

// 전역 변수 추가
let galleryData = [];
let currentPage = 1;
const itemsPerPage = 20;
let currentSortOrder = "newest"; // 'newest' 또는 'oldest'
let isLoading = false;

// 정역 변수에 필터링된 데이터를 저장할 변수 추가
let filteredGalleryData = [];

// 정렬 버튼 이벤트 리스너 수정
document.getElementById("sortNewest").addEventListener("click", () => {
  currentSortOrder = "newest";
  currentPage = 1;
  displayGallery(filteredGalleryData);
});

document.getElementById("sortOldest").addEventListener("click", () => {
  currentSortOrder = "oldest";
  currentPage = 1;
  displayGallery(filteredGalleryData);
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
    fullImg.loading = "preload";

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
      modal.style.display = "block";

      // 다운로드 버튼 클릭 이벤트 수정
      downloadBtn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
          const response = await fetch(item.imgURL);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = `${item.id}.jpg`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (error) {
          console.error("다운로드 중 오류 발생:", error);
        }
      };
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

// 일괄 날짜 수정 기능
document
  .getElementById("updateCommonDate")
  .addEventListener("click", function () {
    const dateInput = document.getElementById("commonDateInput");
    const selectedDate = new Date(dateInput.value);

    if (dateInput.value) {
      const newDateTag = `#${selectedDate.getFullYear()}년${(
        selectedDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}월${selectedDate
        .getDate()
        .toString()
        .padStart(2, "0")}일`;

      // 모든 태그 컨테이너를 찾아서 날짜 태그 수정
      const allTagsContainers = document.querySelectorAll(".tags-container");
      allTagsContainers.forEach((container) => {
        // 기존 날짜 태그 찾기 및 제거
        const tags = container.querySelectorAll(".tag");
        tags.forEach((tag) => {
          if (tag.textContent.match(/^#\d{4}년\d{2}월\d{2}일$/)) {
            container.removeChild(tag);
          }
        });

        // 새로운 날짜 태그 추가
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = newDateTag;

        // 태그 클릭 시 삭제
        tag.addEventListener("click", () => {
          container.removeChild(tag);
        });

        container.insertBefore(tag, container.firstChild);
      });
    }
  });

// 다운로드 버튼 이벤트 리스너 추가
document
  .getElementById("downloadButton")
  .addEventListener("click", function (e) {
    e.stopPropagation(); // 이벤트 버블링 방지
  });

// 이미지 리사이징 함수 추가
async function resizeImage(base64Str, maxWidth = 1920) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // 비율 계산
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8)); // 품질 80%로 압축
    };
  });
}

fetchAndDisplayData();
