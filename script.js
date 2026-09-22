const carGrid = document.getElementById("carGrid");


// 자동차 버튼 만들기
CAR_CATEGORIES.forEach(car => {

  const button = document.createElement("button");

  button.className = "car-card";

  button.innerHTML = `
    <div class="car-emoji">${car.emoji}</div>
    <div class="car-name">${car.name}</div>
  `;


  // 버튼 클릭
  button.addEventListener("click", () => {

    openGoogleImages(car.search);

  });


  carGrid.appendChild(button);

});


// Google 이미지 검색 열기
function openGoogleImages(searchText) {

  const query = encodeURIComponent(searchText);

  const googleUrl =
    `https://www.google.com/search?tbm=isch&q=${query}`;

  window.location.href = googleUrl;

}