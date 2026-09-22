let currentCategory = "";

let photos = [];

let currentIndex = 0;

let touchStartX = 0;

let touchStartY = 0;



/*
========================================
금지 단어
========================================
*/

const BAD_KEYWORDS = [

  "interior",
  "inside",
  "dashboard",
  "steering wheel",
  "engine",
  "engine bay",
  "motor",
  "wheel",
  "tire",
  "tyre",
  "rim",
  "brake",
  "part",
  "parts",
  "component",
  "detail",
  "close up",
  "close-up",
  "closeup",

  "person",
  "people",
  "man",
  "woman",
  "child",
  "crowd",

  "landscape",
  "mountain",
  "building",
  "street",
  "road",
  "sky",
  "nature",

  "station",
  "bus stop",
  "waiting",

  "food",
  "restaurant",
  "house",
  "home"
];



/*
========================================
사진 설명 만들기
========================================
*/

function getPhotoText(photo) {

  return (

    (photo.alt || "") +
    " " +
    (photo.url || "") +
    " " +
    (photo.photographer || "")

  ).toLowerCase();

}



/*
========================================
금지 단어 검사
========================================
*/

function containsBadKeyword(photo) {

  const text =
    getPhotoText(photo);


  return BAD_KEYWORDS.some(
    keyword =>
      text.includes(
        keyword.toLowerCase()
      )
  );

}



/*
========================================
카테고리 키워드 검사
========================================
*/

function containsCarKeyword(
  photo,
  category
) {

  const data =
    CAR_CATEGORIES[category];


  if (!data || !data.keywords) {

    return true;

  }


  const text =
    getPhotoText(photo);


  return data.keywords.some(
    keyword =>
      text.includes(
        keyword.toLowerCase()
      )
  );

}



/*
========================================
사진 품질 검사
========================================
*/

function isGoodPhoto(
  photo,
  category
) {


  if (!photo) {
    return false;
  }


  /*
  너무 작은 사진 제외
  */

  if (
    !photo.width ||
    !photo.height
  ) {

    return false;

  }


  if (
    photo.width < 800 ||
    photo.height < 500
  ) {

    return false;

  }



  /*
  세로 사진 제외
  */

  if (
    photo.height > photo.width
  ) {

    return false;

  }



  /*
  자동차와 상관없는 단어 제외
  */

  if (
    containsBadKeyword(photo)
  ) {

    return false;

  }



  /*
  카테고리와 관계없는 사진 제외
  */

  if (
    !containsCarKeyword(
      photo,
      category
    )
  ) {

    return false;

  }


  return true;

}



/*
========================================
카테고리 열기
========================================
*/

async function openGallery(
  category
) {

  currentCategory =
    category;


  document
    .getElementById("homeScreen")
    .style.display = "none";


  document
    .getElementById("galleryScreen")
    .style.display = "flex";


  const data =
    CAR_CATEGORIES[category];


  document
    .getElementById("galleryTitle")
    .textContent =
      data
        ? data.name
        : category;


  document
    .getElementById("gallerySubtitle")
    .textContent =
      "멋진 자동차를 찾아볼까요?";


  await loadCars(category);

}



/*
========================================
홈으로
========================================
*/

function goHome() {


  speechSynthesis.cancel();


  document
    .getElementById("galleryScreen")
    .style.display = "none";


  document
    .getElementById("homeScreen")
    .style.display = "flex";


  photos = [];

  currentIndex = 0;

}



/*
========================================
Pexels 검색
========================================
*/

async function searchPexels(
  query
) {


  const url =

    "https://api.pexels.com/v1/search" +

    "?query=" +
    encodeURIComponent(query) +

    "&orientation=landscape" +

    "&size=large" +

    "&per_page=80" +

    "&locale=ko-KR";


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


  return data.photos || [];

}



/*
========================================
중복 제거
========================================
*/

function removeDuplicates(
  list
) {


  const result = [];

  const ids =
    new Set();


  for (
    const photo of list
  ) {

    if (
      !ids.has(photo.id)
    ) {

      ids.add(photo.id);

      result.push(photo);

    }

  }


  return result;

}



/*
========================================
자동차 사진 불러오기
========================================
*/

async function loadCars(
  category
) {


  const loading =
    document.getElementById(
      "loading"
    );


  const error =
    document.getElementById(
      "error"
    );


  const photoBox =
    document.getElementById(
      "photoBox"
    );


  loading.style.display =
    "block";


  error.textContent =
    "";


  photoBox.style.display =
    "none";


  photos = [];

  currentIndex = 0;



  try {


    if (
      !PEXELS_API_KEY ||
      PEXELS_API_KEY ===
      "YOUR_PEXELS_API_KEY"
    ) {

      throw new Error(
        "Pexels API 키가 없습니다."
      );

    }



    /*
    다른 자동차
    */

    if (
      category ===
      "다른 자동차"
    ) {

      await loadOtherCars();

      loading.style.display =
        "none";

      return;

    }



    const data =
      CAR_CATEGORIES[category];


    if (!data) {

      throw new Error(
        "카테고리를 찾을 수 없습니다."
      );

    }



    /*
    딱 하나의 검색어만 사용
    */

    const result =
      await searchPexels(
        data.search
      );



    /*
    엄격하게 필터링
    */

    let filtered =
      result.filter(
        photo =>
          isGoodPhoto(
            photo,
            category
          )
      );



    /*
    결과 랜덤
    */

    filtered =
      shuffleArray(
        filtered
      );



    /*
    최대 30장
    */

    photos =
      filtered.slice(
        0,
        30
      );



    /*
    결과가 너무 적으면
    조금 완화해서 다시 검사
    */

    if (
      photos.length < 3
    ) {

      filtered =
        result.filter(
          photo => {

            if (!photo) {
              return false;
            }


            if (
              photo.width <
              800
            ) {

              return false;

            }


            if (
              photo.height >
              photo.width
            ) {

              return false;

            }


            if (
              containsBadKeyword(
                photo
              )
            ) {

              return false;

            }


            return true;

          }
        );


      photos =
        shuffleArray(
          filtered
        ).slice(
          0,
          20
        );

    }



    if (
      photos.length === 0
    ) {

      throw new Error(
        "자동차 사진을 찾지 못했어요."
      );

    }



    showPhoto();


  } catch (e) {

    console.error(e);


    error.textContent =
      "자동차 사진을 찾지 못했어요. 😢";


    showEmoji();

  }


  loading.style.display =
    "none";

}



/*
========================================
다른 자동차
========================================
*/

async function loadOtherCars() {


  const randomCar =

    OTHER_CARS[
      Math.floor(
        Math.random() *
        OTHER_CARS.length
      )
    ];


  window.otherCarName =
    randomCar.name;


  window.otherCarEmoji =
    randomCar.emoji;



  const result =
    await searchPexels(
      randomCar.search
    );



  let filtered =
    result.filter(
      photo => {

        if (!photo) {
          return false;
        }


        if (
          photo.width <
          800
        ) {

          return false;

        }


        if (
          photo.height >
          photo.width
        ) {

          return false;

        }


        if (
          containsBadKeyword(
            photo
          )
        ) {

          return false;

        }


        return true;

      }
    );



  photos =
    shuffleArray(
      filtered
    ).slice(
      0,
      20
    );


  currentIndex = 0;



  if (
    photos.length === 0
  ) {

    throw new Error(
      "자동차 사진을 찾지 못했어요."
    );

  }


  showPhoto();

}



/*
========================================
사진 표시
========================================
*/

function showPhoto() {


  if (
    !photos.length
  ) {

    showEmoji();

    return;

  }


  const photo =
    photos[currentIndex];


  const image =
    document.getElementById(
      "carImage"
    );


  const emojiBox =
    document.getElementById(
      "emojiBox"
    );


  const photoBox =
    document.getElementById(
      "photoBox"
    );


  const name =
    document.getElementById(
      "carName"
    );


  const category =
    document.getElementById(
      "carCategory"
    );


  const counter =
    document.getElementById(
      "counter"
    );


  const credit =
    document.getElementById(
      "credit"
    );



  /*
  large 이미지 사용
  */

  image.src =
    photo.src.large;


  image.alt =
    photo.alt ||
    currentCategory;


  image.style.display =
    "block";


  emojiBox.style.display =
    "none";



  let displayName;


  if (
    currentCategory ===
    "다른 자동차"
  ) {

    displayName =
      window.otherCarName ||
      "자동차";

  } else {

    displayName =
      CAR_CATEGORIES[
        currentCategory
      ].name;

  }



  name.textContent =
    displayName;


  category.textContent =
    currentCategory;


  counter.textContent =
    `${currentIndex + 1} / ${photos.length}`;



  if (
    photo.photographer
  ) {

    credit.textContent =
      `사진: ${photo.photographer} / Pexels`;

  } else {

    credit.textContent =
      "사진 제공: Pexels";

  }



  photoBox.style.display =
    "flex";

}



/*
========================================
사진 없음
========================================
*/

function showEmoji() {


  const image =
    document.getElementById(
      "carImage"
    );


  const emojiBox =
    document.getElementById(
      "emojiBox"
    );


  image.style.display =
    "none";


  emojiBox.style.display =
    "flex";


  const data =
    CAR_CATEGORIES[
      currentCategory
    ];


  emojiBox.textContent =
    data
      ? data.emoji
      : "🚗";

}



/*
========================================
다음
========================================
*/

function nextCar() {


  if (
    !photos.length
  ) return;


  currentIndex++;


  if (
    currentIndex >=
    photos.length
  ) {

    currentIndex = 0;

  }


  showPhoto();

}



/*
========================================
이전
========================================
*/

function previousCar() {


  if (
    !photos.length
  ) return;


  currentIndex--;


  if (
    currentIndex < 0
  ) {

    currentIndex =
      photos.length - 1;

  }


  showPhoto();

}



/*
========================================
랜덤 섞기
========================================
*/

function shuffleArray(
  array
) {


  const result =
    [...array];


  for (
    let i =
      result.length - 1;
    i > 0;
    i--
  ) {


    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );


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



/*
========================================
음성
========================================
*/

function speakCar() {


  let text;


  if (
    currentCategory ===
    "다른 자동차"
  ) {

    text =
      window.otherCarName ||
      "자동차";

  } else {

    text =
      CAR_CATEGORIES[
        currentCategory
      ]?.name ||
      "자동차";

  }


  speechSynthesis.cancel();


  const utterance =
    new SpeechSynthesisUtterance(
      text
    );


  utterance.lang =
    "ko-KR";


  utterance.rate =
    0.8;


  utterance.pitch =
    1.1;


  speechSynthesis.speak(
    utterance
  );

}



/*
========================================
사진 클릭
========================================
*/

document
  .getElementById(
    "carImage"
  )
  .addEventListener(
    "click",
    function () {


      this.classList.remove(
        "pop"
      );


      void this.offsetWidth;


      this.classList.add(
        "pop"
      );


      speakCar();

    }
  );



/*
========================================
카테고리 버튼
========================================
*/

document
  .querySelectorAll(
    ".category-card"
  )
  .forEach(
    button => {


      button.addEventListener(
        "click",
        () => {


          openGallery(
            button.dataset.category
          );

        }
      );

    }
  );



/*
========================================
뒤로가기
========================================
*/

document
  .getElementById(
    "backButton"
  )
  .addEventListener(
    "click",
    goHome
  );



/*
========================================
이전 / 다음
========================================
*/

document
  .getElementById(
    "prevButton"
  )
  .addEventListener(
    "click",
    previousCar
  );


document
  .getElementById(
    "nextButton"
  )
  .addEventListener(
    "click",
    nextCar
  );



/*
========================================
음성 버튼
========================================
*/

document
  .getElementById(
    "speakButton"
  )
  .addEventListener(
    "click",
    speakCar
  );



/*
========================================
스와이프
========================================
*/

const photoBox =
  document.getElementById(
    "photoBox"
  );


photoBox.addEventListener(
  "touchstart",
  event => {


    touchStartX =
      event.changedTouches[0]
        .screenX;


    touchStartY =
      event.changedTouches[0]
        .screenY;

  },
  {
    passive: true
  }
);


photoBox.addEventListener(
  "touchend",
  event => {


    const touchEndX =
      event.changedTouches[0]
        .screenX;


    const touchEndY =
      event.changedTouches[0]
        .screenY;


    const diffX =
      touchEndX -
      touchStartX;


    const diffY =
      touchEndY -
      touchStartY;


    if (
      Math.abs(diffX) > 55 &&
      Math.abs(diffX) >
      Math.abs(diffY)
    ) {


      if (
        diffX < 0
      ) {

        nextCar();

      } else {

        previousCar();

      }

    }

  },
  {
    passive: true
  }
);