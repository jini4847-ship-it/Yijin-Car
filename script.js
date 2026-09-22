// ========================================
// 상태
// ========================================

let currentCategory = "";

let photos = [];

let currentIndex = 0;

let touchStartX = 0;

let touchStartY = 0;


// ========================================
// DOM
// ========================================

const homeScreen =
  document.getElementById("homeScreen");

const galleryScreen =
  document.getElementById("galleryScreen");

const galleryTitle =
  document.getElementById("galleryTitle");

const gallerySubtitle =
  document.getElementById("gallerySubtitle");

const carImage =
  document.getElementById("carImage");

const carName =
  document.getElementById("carName");

const carCategory =
  document.getElementById("carCategory");

const counter =
  document.getElementById("counter");

const loading =
  document.getElementById("loading");

const errorBox =
  document.getElementById("error");

const credit =
  document.getElementById("credit");

const photoBox =
  document.getElementById("photoBox");

const emojiBox =
  document.getElementById("emojiBox");


// ========================================
// API 키 확인
// ========================================

function hasApiKey() {

  return (

    typeof PEXELS_API_KEY !== "undefined" &&

    PEXELS_API_KEY !== "" &&

    PEXELS_API_KEY !==
      "YOUR_PEXELS_API_KEY"

  );

}


// ========================================
// 화면 전환
// ========================================

function openGallery(category) {

  currentCategory = category;

  currentIndex = 0;

  photos = [];

  homeScreen.classList.add("hidden");

  galleryScreen.classList.remove("hidden");

  window.scrollTo(0, 0);

  loadCars(category);

}


function goHome() {

  speechSynthesis.cancel();

  galleryScreen.classList.add("hidden");

  homeScreen.classList.remove("hidden");

  window.scrollTo(0, 0);

}


// ========================================
// 로딩
// ========================================

function showLoading() {

  loading.classList.remove("hidden");

}


function hideLoading() {

  loading.classList.add("hidden");

}


// ========================================
// 오류
// ========================================

function showError(message) {

  errorBox.textContent = message;

  errorBox.classList.remove("hidden");

}


function hideError() {

  errorBox.classList.add("hidden");

}


// ========================================
// 자동차 가져오기
// ========================================

async function loadCars(category) {

  hideError();

  showLoading();

  photoBox.classList.add("hidden");

  emojiBox.classList.add("hidden");

  credit.textContent = "";

  counter.textContent = "";


  /*
   * 다른 자동차
   */

  if (category === "다른 자동차") {

    await loadOtherCars();

    return;

  }


  const info =
    CAR_CATEGORIES[category];


  galleryTitle.textContent =
    info.emoji + " " + category;


  gallerySubtitle.textContent =
    "좋아하는 " +
    category +
    "를 만나보세요!";


  /*
   * API 키가 없으면
   * 이모지를 보여준다.
   */

  if (!hasApiKey()) {

    hideLoading();

    showEmoji(info);

    showError(
      "config.js에 Pexels API 키를 넣어주세요."
    );

    return;

  }


  try {

    const url =

      "https://api.pexels.com/v1/search" +

      "?query=" +

      encodeURIComponent(info.search) +

      "&per_page=30" +

      "&page=1" +

      "&orientation=landscape";


    const response =

      await fetch(

        url,

        {

          headers: {

            Authorization:
              PEXELS_API_KEY

          }

        }

      );


    if (!response.ok) {

      throw new Error(
        "Pexels API 오류"
      );

    }


    const data =
      await response.json();


    photos =
      data.photos || [];


    if (photos.length === 0) {

      throw new Error(
        "사진 없음"
      );

    }


    /*
     * 사진을 랜덤하게 섞는다.
     */

    shuffle(photos);


    hideLoading();

    showPhoto();

  }

  catch (error) {

    console.error(error);

    hideLoading();

    showEmoji(info);

    showError(
      "사진을 불러오지 못했어요."
    );

  }

}


// ========================================
// 다른 자동차
// ========================================

async function loadOtherCars() {

  galleryTitle.textContent =
    "🚘 다른 자동차";

  gallerySubtitle.textContent =
    "어떤 자동차가 나올까요?";


  if (!hasApiKey()) {

    hideLoading();

    showEmoji(
      CAR_CATEGORIES["다른 자동차"]
    );

    showError(
      "config.js에 Pexels API 키를 넣어주세요."
    );

    return;

  }


  try {

    /*
     * 여러 검색어 중에서
     * 랜덤으로 하나 선택
     */

    const randomType =
      OTHER_CARS[
        Math.floor(
          Math.random() *
          OTHER_CARS.length
        )
      ];


    const url =

      "https://api.pexels.com/v1/search" +

      "?query=" +

      encodeURIComponent(
        randomType.search
      ) +

      "&per_page=20" +

      "&page=1" +

      "&orientation=landscape";


    const response =

      await fetch(

        url,

        {

          headers: {

            Authorization:
              PEXELS_API_KEY

          }

        }

      );


    if (!response.ok) {

      throw new Error(
        "Pexels API 오류"
      );

    }


    const data =
      await response.json();


    photos =
      data.photos || [];


    if (photos.length === 0) {

      throw new Error(
        "사진 없음"
      );

    }


    /*
     * 랜덤 순서
     */

    shuffle(photos);


    /*
     * 이번에 선택된 자동차 종류를
     * 표시하기 위한 정보
     */

    window.otherCarName =
      randomType.name;

    window.otherCarEmoji =
      randomType.emoji;


    hideLoading();

    showPhoto();


  }

  catch (error) {

    console.error(error);

    hideLoading();

    showEmoji(
      CAR_CATEGORIES["다른 자동차"]
    );

    showError(
      "자동차 사진을 불러오지 못했어요."
    );

  }

}


// ========================================
// 사진 보여주기
// ========================================

function showPhoto() {

  if (photos.length === 0) {

    return;

  }


  photoBox.classList.remove("hidden");

  emojiBox.classList.add("hidden");


  const photo =
    photos[currentIndex];


  carImage.src =
    photo.src.large;


  /*
   * 일반 카테고리
   */

  if (
    currentCategory !==
    "다른 자동차"
  ) {

    const info =
      CAR_CATEGORIES[
        currentCategory
      ];


    carName.textContent =
      info.name;

    carCategory.textContent =
      currentCategory;

  }


  /*
   * 다른 자동차
   */

  else {

    carName.textContent =
      window.otherCarName ||
      "자동차";

    carCategory.textContent =
      "다른 자동차";

  }


  counter.textContent =
    `${currentIndex + 1} / ${photos.length}`;


  /*
   * Pexels 출처
   */

  if (photo.photographer) {

    credit.innerHTML =

      `📷 Photo by ` +

      `<a href="${photo.photographer_url}" ` +

      `target="_blank" ` +

      `rel="noopener">` +

      escapeHtml(
        photo.photographer
      ) +

      `</a> on Pexels`;

  }


}


// ========================================
// 이모지
// ========================================

function showEmoji(info) {

  photoBox.classList.add("hidden");

  emojiBox.classList.remove("hidden");


  emojiBox.textContent =
    info.emoji;


  carName.textContent =
    info.name;

  carCategory.textContent =
    currentCategory;

}


// ========================================
// 다음
// ========================================

function nextCar() {

  if (photos.length === 0) {

    return;

  }


  currentIndex++;


  if (
    currentIndex >=
    photos.length
  ) {

    currentIndex = 0;

  }


  showPhoto();

}


// ========================================
// 이전
// ========================================

function previousCar() {

  if (photos.length === 0) {

    return;

  }


  currentIndex--;


  if (currentIndex < 0) {

    currentIndex =
      photos.length - 1;

  }


  showPhoto();

}


// ========================================
// 랜덤 섞기
// ========================================

function shuffle(array) {

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );


    [
      array[i],
      array[j]
    ] = [
      array[j],
      array[i]
    ];

  }

}


// ========================================
// 음성
// ========================================

function speakCar() {

  if (
    !("speechSynthesis" in window)
  ) {

    return;

  }


  speechSynthesis.cancel();


  let text;


  if (
    currentCategory ===
    "다른 자동차"
  ) {

    text =
      window.otherCarName ||
      "자동차";

  }

  else {

    text =
      CAR_CATEGORIES[
        currentCategory
      ].name;

  }


  const speech =
    new SpeechSynthesisUtterance(
      text
    );


  speech.lang =
    "ko-KR";


  speech.rate =
    0.8;


  speech.pitch =
    1.1;


  speechSynthesis.speak(
    speech
  );

}


// ========================================
// 사진 터치
// ========================================

photoBox.addEventListener(

  "click",

  function() {

    photoBox.classList.remove(
      "pop"
    );


    void photoBox.offsetWidth;


    photoBox.classList.add(
      "pop"
    );


    speakCar();

  }

);


// ========================================
// 스와이프 시작
// ========================================

photoBox.addEventListener(

  "touchstart",

  function(event) {

    const touch =
      event.changedTouches[0];


    touchStartX =
      touch.clientX;


    touchStartY =
      touch.clientY;

  },

  {
    passive: true
  }

);


// ========================================
// 스와이프 끝
// ========================================

photoBox.addEventListener(

  "touchend",

  function(event) {

    const touch =
      event.changedTouches[0];


    const deltaX =
      touch.clientX -
      touchStartX;


    const deltaY =
      touch.clientY -
      touchStartY;


    if (

      Math.abs(deltaX) > 55 &&

      Math.abs(deltaX) >
      Math.abs(deltaY)

    ) {

      if (deltaX < 0) {

        nextCar();

      }

      else {

        previousCar();

      }

    }

  },

  {
    passive: true
  }

);


// ========================================
// 카테고리 버튼
// ========================================

document
  .querySelectorAll(
    ".category-card"
  )
  .forEach(button => {

    button.addEventListener(

      "click",

      function() {

        openGallery(
          this.dataset.category
        );

      }

    );

  });


// ========================================
// 뒤로가기
// ========================================

document
  .getElementById(
    "backButton"
  )
  .addEventListener(
    "click",
    goHome
  );


// ========================================
// 다음 / 이전
// ========================================

document
  .getElementById(
    "nextButton"
  )
  .addEventListener(
    "click",
    nextCar
  );


document
  .getElementById(
    "prevButton"
  )
  .addEventListener(
    "click",
    previousCar
  );


// ========================================
// 음성 버튼
// ========================================

document
  .getElementById(
    "speakButton"
  )
  .addEventListener(
    "click",
    speakCar
  );


// ========================================
// HTML 문자 처리
// ========================================

function escapeHtml(text) {

  return String(text)

    .replace(
      /[&<>"']/g,

      function(character) {

        return {

          "&": "&amp;",

          "<": "&lt;",

          ">": "&gt;",

          '"': "&quot;",

          "'": "&#039;"

        }[character];

      }

    );

}