let currentCategory = "";
let photos = [];
let currentIndex = 0;

let touchStartX = 0;
let touchStartY = 0;


// ======================================
// 카테고리 열기
// ======================================

async function openGallery(category) {

  currentCategory = category;

  document.getElementById("homeScreen").style.display = "none";
  document.getElementById("galleryScreen").style.display = "flex";

  const categoryData = CAR_CATEGORIES[category];

  document.getElementById("galleryTitle").textContent =
    categoryData ? categoryData.name : category;

  document.getElementById("gallerySubtitle").textContent =
    "멋진 자동차를 찾아볼까요?";

  await loadCars(category);
}


// ======================================
// 홈으로 돌아가기
// ======================================

function goHome() {

  speechSynthesis.cancel();

  document.getElementById("galleryScreen").style.display = "none";
  document.getElementById("homeScreen").style.display = "flex";

  photos = [];
  currentIndex = 0;
}


// ======================================
// Pexels 검색
// ======================================

async function searchPexels(query) {

  const url =
    `https://api.pexels.com/v1/search` +
    `?query=${encodeURIComponent(query)}` +
    `&orientation=landscape` +
    `&size=large` +
    `&locale=ko-KR` +
    `&per_page=20`;

  const response = await fetch(url, {
    headers: {
      Authorization: PEXELS_API_KEY
    }
  });

  if (!response.ok) {
    throw new Error("Pexels API 오류");
  }

  const data = await response.json();

  return data.photos || [];
}


// ======================================
// 자동차 불러오기
// ======================================

async function loadCars(category) {

  const loading = document.getElementById("loading");
  const error = document.getElementById("error");

  loading.style.display = "block";
  error.textContent = "";

  document.getElementById("photoBox").style.display = "none";

  photos = [];
  currentIndex = 0;

  try {

    if (!PEXELS_API_KEY || PEXELS_API_KEY === "YOUR_PEXELS_API_KEY") {

      throw new Error(
        "Pexels API 키를 config.js에 입력해주세요."
      );
    }


    // ==================================
    // 다른 자동차
    // ==================================

    if (category === "다른 자동차") {

      await loadOtherCars();

      loading.style.display = "none";
      return;
    }


    // ==================================
    // 일반 카테고리
    // ==================================

    const categoryData = CAR_CATEGORIES[category];

    if (!categoryData) {
      throw new Error("자동차 카테고리를 찾을 수 없습니다.");
    }


    // 검색어 중복 제거
    const searchList = [...new Set(categoryData.search)];


    // 여러 검색 결과를 합침
    let allPhotos = [];

    for (const query of searchList) {

      try {

        const result = await searchPexels(query);

        allPhotos = [
          ...allPhotos,
          ...result
        ];

      } catch (e) {

        console.log("검색 실패:", query);
      }
    }


    // 사진 중복 제거
    const uniquePhotos = [];

    const usedIds = new Set();

    for (const photo of allPhotos) {

      if (!usedIds.has(photo.id)) {

        usedIds.add(photo.id);
        uniquePhotos.push(photo);
      }
    }


    // 랜덤 섞기
    photos = shuffleArray(uniquePhotos);


    // 최대 30장
    photos = photos.slice(0, 30);


    if (photos.length === 0) {

      throw new Error(
        "사진을 찾지 못했어요."
      );
    }


    showPhoto();

  } catch (err) {

    console.error(err);

    error.textContent =
      "사진을 불러오지 못했어요. 😢";

    showEmoji();

  }

  loading.style.display = "none";
}


// ======================================
// 다른 자동차
// ======================================

async function loadOtherCars() {

  const randomCar =
    OTHER_CARS[
      Math.floor(Math.random() * OTHER_CARS.length)
    ];


  window.otherCarName = randomCar.name;
  window.otherCarEmoji = randomCar.emoji;


  const result =
    await searchPexels(randomCar.search);


  photos = shuffleArray(result).slice(0, 20);

  currentIndex = 0;


  if (photos.length === 0) {

    throw new Error(
      "사진을 찾지 못했어요."
    );
  }


  showPhoto();
}


// ======================================
// 사진 보여주기
// ======================================

function showPhoto() {

  if (!photos.length) {
    showEmoji();
    return;
  }


  const photo = photos[currentIndex];


  const image =
    document.getElementById("carImage");

  const emojiBox =
    document.getElementById("emojiBox");

  const photoBox =
    document.getElementById("photoBox");

  const name =
    document.getElementById("carName");

  const category =
    document.getElementById("carCategory");

  const counter =
    document.getElementById("counter");

  const credit =
    document.getElementById("credit");


  // 사진
  image.src = photo.src.large;

  image.alt =
    photo.alt ||
    currentCategory;


  image.style.display = "block";
  emojiBox.style.display = "none";


  // 이름
  let displayName;

  if (currentCategory === "다른 자동차") {

    displayName =
      window.otherCarName || "자동차";

  } else {

    displayName =
      CAR_CATEGORIES[currentCategory].name;
  }


  name.textContent = displayName;

  category.textContent =
    currentCategory;


  // 번호
  counter.textContent =
    `${currentIndex + 1} / ${photos.length}`;


  // 출처
  if (photo.photographer) {

    credit.innerHTML =
      `사진: ${escapeHtml(photo.photographer)} / Pexels`;

  } else {

    credit.textContent =
      "사진 제공: Pexels";
  }


  photoBox.style.display = "flex";
}


// ======================================
// 사진 없음
// ======================================

function showEmoji() {

  const image =
    document.getElementById("carImage");

  const emojiBox =
    document.getElementById("emojiBox");


  image.style.display = "none";

  emojiBox.style.display = "flex";


  if (currentCategory === "다른 자동차") {

    emojiBox.textContent =
      window.otherCarEmoji || "🚗";

  } else {

    emojiBox.textContent =
      CAR_CATEGORIES[currentCategory]?.emoji || "🚗";
  }
}


// ======================================
// 다음 자동차
// ======================================

function nextCar() {

  if (!photos.length) return;

  currentIndex++;

  if (currentIndex >= photos.length) {
    currentIndex = 0;
  }

  showPhoto();
}


// ======================================
// 이전 자동차
// ======================================

function previousCar() {

  if (!photos.length) return;

  currentIndex--;

  if (currentIndex < 0) {
    currentIndex = photos.length - 1;
  }

  showPhoto();
}


// ======================================
// 배열 랜덤
// ======================================

function shuffleArray(array) {

  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {

    const j =
      Math.floor(Math.random() * (i + 1));

    [
      result[i],
      result[j]
    ] =
    [
      result[j],
      result[i]
    ];
  }

  return result;
}


// ======================================
// 자동차 이름 읽어주기
// ======================================

function speakCar() {

  let text;

  if (currentCategory === "다른 자동차") {

    text =
      window.otherCarName || "자동차";

  } else {

    text =
      CAR_CATEGORIES[currentCategory]?.name ||
      "자동차";
  }


  speechSynthesis.cancel();


  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.lang = "ko-KR";
  utterance.rate = 0.8;
  utterance.pitch = 1.1;


  speechSynthesis.speak(utterance);
}


// ======================================
// HTML 특수문자 처리
// ======================================

function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}


// ======================================
// 사진 클릭
// ======================================

document
  .getElementById("carImage")
  .addEventListener("click", function () {

    this.classList.remove("pop");

    void this.offsetWidth;

    this.classList.add("pop");

    speakCar();
  });


// ======================================
// 카테고리 버튼
// ======================================

document
  .querySelectorAll(".category-card")
  .forEach(button => {

    button.addEventListener("click", () => {

      const category =
        button.dataset.category;

      openGallery(category);
    });

  });


// ======================================
// 뒤로가기
// ======================================

document
  .getElementById("backButton")
  .addEventListener("click", goHome);


// ======================================
// 이전 / 다음
// ======================================

document
  .getElementById("prevButton")
  .addEventListener("click", previousCar);


document
  .getElementById("nextButton")
  .addEventListener("click", nextCar);


// ======================================
// 음성 버튼
// ======================================

document
  .getElementById("speakButton")
  .addEventListener("click", speakCar);


// ======================================
// 터치 스와이프
// ======================================

const photoBox =
  document.getElementById("photoBox");


photoBox.addEventListener(
  "touchstart",
  function (event) {

    touchStartX =
      event.changedTouches[0].screenX;

    touchStartY =
      event.changedTouches[0].screenY;

  },
  { passive: true }
);


photoBox.addEventListener(
  "touchend",
  function (event) {

    const touchEndX =
      event.changedTouches[0].screenX;

    const touchEndY =
      event.changedTouches[0].screenY;


    const diffX =
      touchEndX - touchStartX;

    const diffY =
      touchEndY - touchStartY;


    // 가로 스와이프만 인식
    if (
      Math.abs(diffX) > 55 &&
      Math.abs(diffX) > Math.abs(diffY)
    ) {

      if (diffX < 0) {

        nextCar();

      } else {

        previousCar();
      }

    }

  },
  { passive: true }
);