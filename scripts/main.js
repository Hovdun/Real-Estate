const range = document.querySelector(".properties__filter-item--range");
const filterOn = document.querySelectorAll(".properties__filter-item--hidden");
const filterOff = document.querySelectorAll(
  ".properties__filter-item--visible"
);
const select = document.querySelector(".properties__select-items");
const selectOtions = document.querySelector(".properties__select-options");
const selectValue = document.querySelector(".properties__select-value");

const selectOption = document.querySelector(".properties__select-option");
const rangeFrom = document.querySelector(
  ".properties__filter-item--label__from"
);
const rangeTo = document.querySelector(".properties__filter-item--label__to");
const catalogWrapp = document.querySelector(".properties__swiper-sliders");
const propertiesWrap = document.querySelector(".properties__swiper-wrapper");
const latestWrap = document.querySelector(".gallery__items");

const locations = document.querySelectorAll(".properties__filter-locations");
const locationsWrapp = document.querySelector(
  ".properties__filter-locations__inner"
);
if (locationsWrapp) {
  const locationCheckBoxes = locationsWrapp.querySelectorAll(".check-box");
}
const types = document.querySelectorAll(".properties__filter-type");
const typesWrapp = document.querySelector(".properties__filter-type__inner");
if (typesWrapp) {
  const typeCheckBoxes = typesWrapp.querySelectorAll(".check-box");
}
const categoriesWrapp = document.querySelector(
  ".properties__filter-categories__inner"
);
if (categoriesWrapp) {
  const categoriesCheckBoxes = categoriesWrapp.querySelectorAll(".check-box");
}
const categories = document.querySelectorAll(".properties__filter-categories");
const bedrooms = document.querySelectorAll(".properties__filter-bedroom");
const bedroomsWrapp = document.querySelector(
  ".properties__filter-bedrooms__inner"
);
if (bedroomsWrapp) {
  const bedroomsCheckBoxes = bedroomsWrapp.querySelectorAll(".check-box");
}

const bathrooms = document.querySelectorAll(".properties__filter-bathroom");
const bathroomsWrapp = document.querySelector(
  ".properties__filter-item--visible__bathroom"
);
if (bathroomsWrapp) {
  const bathroomsCheckBoxes = bathroomsWrapp.querySelectorAll(".check-box");
}

async function getItems() {
  const res = await fetch("scripts/catalog.json");
  const data = await res.json();
  const storedFilters = JSON.parse(localStorage.getItem("currentFilters"));
  createItem(data);
  if (storedFilters) {
    currentFilters = storedFilters;
    applyFilters("bathrooms", data);
    applyFilters("bedrooms", data);
    applyFilters("categories", data);
    applyFilters("types", data);
    applyFilters("locations", data);
    applyFilters("price", data);
    applyCheckboxStates();
  }
}

let currentFilters = {
  price: null,
  bathrooms: null,
  bedrooms: null,
  categories: null,
  types: null,
  locations: null,
};

let activeFilter = null;

const filterFunctions = {
  price: (item, values) => item.price >= values[0] && item.price <= values[1],
  bathrooms: (item, rgx) => new RegExp(rgx).test(item.bathroom),
  bedrooms: (item, rgx) => new RegExp(rgx).test(item.bedroom),
  categories: (item, rgx) => new RegExp(rgx).test(item.categories),
  types: (item, rgx) => new RegExp(rgx).test(item.propertyType),
  locations: (item, rgx) => new RegExp(rgx).test(item.location),
};
const filterElements = {
  price: range,
  bathrooms: bathrooms,
  bedrooms: bedrooms,
  categories: categories,
  types: types,
  locations: locations,
};

const applyFilters = (filterType, data) => {
  const filterElement = filterElements[filterType];
  const filterFunction = filterFunctions[filterType];
  if (filterElement) {
    if (filterType === "price") {
      filterElement.noUiSlider.on("update", (values) => {
        currentFilters[filterType] = values.map(parseFloat);
        const filteredData = filterData(data);
        localStorage.setItem("currentFilters", JSON.stringify(currentFilters));
        renderCard(filteredData);
        sortAndFilterData(filteredData);
        updateNoMatchMessage(filteredData.length === 0);
      });
    } else {
      filterElement.forEach((element) => {
        const rgx = new RegExp(element.innerText);
        element.addEventListener("click", () => {
          filterElement.forEach((checkbox) => {
            checkbox.querySelector(".check-box").checked = false;
          });

          element.querySelector(".check-box").checked = true;
          localStorage.setItem(
            "currentFilters",
            JSON.stringify(currentFilters)
          );
          currentFilters[filterType] = element.innerText;
          localStorage.setItem("checkboxState_" + filterType, true);
          const filteredData = filterData(data);
          renderCard(filteredData);
          sortAndFilterData(filteredData);

          updateNoMatchMessage(filteredData.length === 0);
      
        });
      });
    }
  }
};
function applyCheckboxStates() {
  Object.keys(currentFilters).forEach((filterType) => {
    const checkboxStateKey = "checkboxState_" + filterType;
    const checkboxState = localStorage.getItem(checkboxStateKey);

    if (checkboxState === "true") {
      const filterElement = filterElements[filterType];
      if (filterElement) {
        filterElement.forEach((element) => {
          if (element.innerText === currentFilters[filterType]) {
            element.querySelector(".check-box").checked = true;
          }
        });
      }
    }
  });
}

if (range) {
  const savedPriceFilter = JSON.parse(
    localStorage.getItem("currentFilters")
  )?.price;
  const initialPriceRange = savedPriceFilter || [1000, 1000000];

  noUiSlider.create(range, {
    start: initialPriceRange,
    connect: true,
    step: 500,
    range: {
      min: 500,
      max: 1000000,
    },
  });
  const ranges = [rangeFrom, rangeTo];
  range.noUiSlider.on("update", function (values, handle) {
    ranges[handle].innerHTML = Math.round(values[handle]);
  });
}

const filterData = (data) => {
  return data.filter((item) => {
    for (const filterType in currentFilters) {
      if (currentFilters[filterType]) {
        const filterFunction = filterFunctions[filterType];
        const filterValue = currentFilters[filterType];
        if (!filterFunction(item, filterValue)) {
          return false;
        }
      }
    }

    return true;
  });
};

const updateNoMatchMessage = (noMatch) => {
  const noMatchMessage = document.querySelector(
    ".properties__gallery-MatchMessage"
  );
  if (noMatchMessage) {
    noMatchMessage.style.display = noMatch ? "block" : "none";
  }
};
const createItem = (data) => {
  if (latestWrap) {
    renderLatestCard(data);
  }
  renderCard(data);
  applyFilters("price", data);
  applyFilters("bathrooms", data);
  applyFilters("bedrooms", data);
  applyFilters("categories", data);
  updateNoMatchMessage(data.length === 0);
  applyFilters("types", data);
  applyFilters("locations", data);

  if (activeFilter) {
    activeFilter.querySelector(".check-box").checked = false;
    activeFilter = null;
  }
  showDetail(data);
  sortToHigh(data);
  shotByPrice(data);
  sortAndFilterData(data);
};

const renderLatestCard = (latestData) => {
  const latestCatatalog = latestData.slice(0, 6);
  latestCatatalog.forEach((item) => {
    const divElement = document.createElement("div");
    divElement.className = "gallery__item swiper-slide";
    divElement.innerHTML = `
    <img
      src=${item.img}
      alt="apartment"
      class="gallery__item-img"
    />
    <div class="gallery__item-title">
    ${item.title}
    </div>
    <span class="gallery__item-price">$${item.price}</span>
    <div class="gallery__item-descr">
      ${item.description}
    </div>
    <div class="gallery__item-options">
      <div class="gallery__item-option">
        <img
          src="images/bedroom.svg"
          alt="bedroom"
          class="gallery__item-option__img"
        />
        <span class="gallery__item-option__count">${item.bedroom}</span>
      </div>
      <div class="gallery__item-option">
        <img
          src="images/bathroom.svg"
          alt="bedroom"
          class="gallery__item-option__img"
        />
        <span class="gallery__item-option__count">${item.bathroom}</span>
      </div>
      <div class="gallery__item-option">
        <img
          src="images/car.svg"
          alt="bedroom"
          class="gallery__item-option__img"
        />
        <span class="gallery__item-option__count">${item.garage}</span>
      </div>
    </div>
    <div class="gallery__item-stick"></div>

    <div class="gallery__item-realtor">
      <div class="gallery__item-realtor--info">
        <img
          src=${item.imgRieltor}
          alt="rieltor"
          class="gallery__item-realtor--img"
        />
        <span class="gallery__item-realtor--name">${item.rieltor}</span>
      </div>
      <button class="gallery__item-realtor-btn" data-property-id="${item.id}">+</button>
    </div> 
    `;

    latestWrap.appendChild( divElement);
  });
};


const productsContainer = document.querySelector(".properties__products-container");
const paginationBullets = document.querySelector(".properties__pagination-bullets");


let currentPage = 1;
const itemsPerPage = 6;

const renderCard = (data) => {
  const catalog = [];
  data.forEach((elem) => {
    catalog.push(elem);
  });
  setupPagination(catalog);
  displayProducts(catalog);
};


function displayProducts(products) {
  if(productsContainer){
    productsContainer.innerHTML = "";

  }
  currentPage--;

  const start = itemsPerPage * currentPage;
  const end = start + itemsPerPage;
  const paginatedProducts = products.slice(start, end);

  paginatedProducts.forEach(product => {
    const divElement = document.createElement("div");
  divElement.className = "gallery__item-wrapper";
    divElement.innerHTML = `
    <img
      src=${product.img}
      alt="apartment"
      class="gallery__item-img"
    />
    <div class="gallery__item-inner">
      <div
        class="gallery__item-title properties__gallery-item--title"
      >
        ${product.title}
      </div>
      <span class="gallery__item-price">$${product.price}</span>
      <div class="gallery__item-descr">
        ${product.description}
      </div>
     <div class="gallery__item-options">
        <div class="gallery__item-option">
          <img
            src="images/bedroom.svg"
            alt="bedroom"
            class="gallery__item-option__img"
          />
          <span class="gallery__item-option__count">${product.bedroom}</span>
        </div>
        <div class="gallery__item-option">
          <img
            src="images/bathroom.svg"
            alt="bedroom"
            class="gallery__item-option__img"
          />
          <span class="gallery__item-option__count">${product.bathroom}</span>
        </div>
        <div class="gallery__item-option">
          <img
            src="images/car.svg"
            alt="bedroom"
            class="gallery__item-option__img"
          />
          <span class="gallery__item-option__count">${product.garage}</span>
        </div>
      </div>
      <div class="gallery__item-stick"></div>

      <div class="gallery__item-realtor">
        <div class="gallery__item-realtor--info">
          <img
            src=${product.imgRieltor}
            alt="rieltor"
            class="gallery__item-realtor--img"
          />
          <span class="gallery__item-realtor--name"
            >${product.rieltor}</span
          >
        </div>
        <button class="gallery__item-realtor-btn" data-property-id="${product.id}">+</button>
      </div>
    </div>
  `;
if(productsContainer){
  productsContainer.appendChild(divElement);

}
  });
}


function setupPagination(products) {
  const bulletsContainer = document.querySelector(".properties__pagination-bullets");
  currentPage = 1;

  const pageCount = Math.ceil(products.length / itemsPerPage);
  if(bulletsContainer){
    if(pageCount<= 1){
      bulletsContainer.style.display = "none";
    }else{
      bulletsContainer.style.display = "flex";
    }
    bulletsContainer.innerHTML = "";

  }

  const bullets = [];

  for (let i = 1; i <= pageCount; i++) {
    const pageButton = document.createElement("div");
    pageButton.className = 'properties__pagination-bullet';
    pageButton.textContent = i;
    if (i === currentPage) {
      pageButton.classList.add('properties__active-bullet');
    }

    pageButton.addEventListener("click", function () {
      currentPage = i;
      displayProducts(products);
      window.scrollTo(0, 0);

      bullets.forEach(bullet => {
        bullet.classList.remove('properties__active-bullet');
      });

      pageButton.classList.add('properties__active-bullet');
    });

    bullets.push(pageButton);
    if(bulletsContainer){
      bulletsContainer.appendChild(pageButton);

    }
  }

}


window.addEventListener("click", (event) => {
  if (event.target.classList.contains("gallery__item-realtor-btn")) {
    const propertyId = event.target.getAttribute("data-property-id");
    redirectToPropertyDetailPage(propertyId);
  }
});
const redirectToPropertyDetailPage = (propertyId) => {
  window.location.href = `product.html?id=${propertyId}`;
};
const showDetail = (data) => {
  const queryParams = new URLSearchParams(window.location.search);
  const propertyId = queryParams.get("id");
  const productWrapp = document.querySelector(".product");
  const propertyData = data.find((property) => property.id === propertyId);

  if (productWrapp && propertyData) {
    document
      .querySelector(".product__img")
      .setAttribute("src", propertyData.full_img);
    document.querySelector(
      ".product__details-title"
    ).innerHTML = `${propertyData.title}`;
    document.querySelector(
      ".product__details-price"
    ).innerHTML = `$${propertyData.price}`;
    document.querySelector(
      ".dimensions"
    ).innerHTML = `${propertyData.dimensions}`;
    document.querySelector(".area").innerHTML = `${propertyData.area}`;
    document.querySelector(".year").innerHTML = `${propertyData.year}`;
    document.querySelector(".bedroom").innerHTML = ` ${propertyData.bedroom}`;
    document.querySelector(".bathroom").innerHTML = ` ${propertyData.bathroom}`;
    document.querySelector(
      ".categories"
    ).innerHTML = ` ${propertyData.categories}`;
    document
      .querySelector(".product__info-call__agent-img")
      .setAttribute("src", propertyData.imgRieltor);
    document.querySelector(
      ".product__info-call__agent-name"
    ).innerHTML = `${propertyData.rieltor}`;
  }
};

const showFilter = () => {
  filterOn.forEach((item) => {
    const filterBtn = item.querySelector(".properties__filter-btn");
    item.addEventListener("click", () => {
      const visibleFilter = item.nextElementSibling;
      visibleFilter.classList.toggle("hide-filter");
      if (visibleFilter.classList.contains("hide-filter")) {
        filterBtn.style.transform = "rotate(-180deg)";
      } else {
        filterBtn.style.transform = "rotate(0deg)";
      }
    });
  });
};
showFilter();
const gallerySwiper = new Swiper(".swiper", {
  slidesPerView: 3,
  spaceBetween: 8,
  breakpoints: {
    320: {
      slidesPerView: 1,
    },
    1200: {
      slidesPerView: 3,
    },
  },
  navigation: {
    nextEl: ".gallery-button-next",
    prevEl: ".gallery-button-prev",
  },
});
const reviewsSwiper = new Swiper(".reviews-swiper", {
  slidesPerView: "auto",
  slideClass: "reviews__slides",
  wrapperClass: "reviews__swiper-wrapp",
  spaceBetween: 10,
  breakpoints: {
    320: {
      slidesPerView: 1,
    },
    480: {
      slidesPerView: 2,
    },
    1000: {
      slidesPerView: "auto",
    },
  },
  navigation: {
    nextEl: ".reviews-button-next",
    prevEl: ".reviews-button-prev",
  },
});
const projectsSwiper = new Swiper(".projects__swiper", {
  slidesPerView: "2",
  sliderPerGroup: "1",
  slideClass: "projects__slide",
  wrapperClass: "projects__swiper-wrapper",
  breakpoints: {
    320: {
      slidesPerView: 1,
    },
    481: {
      slidesPerView: 2,
    },
  },
  spaceBetween: 20,
  navigation: {
    nextEl: ".projects-button-next",
    prevEl: ".projects-button-prev",
  },
});

const sortToHigh = (data) => {
  const sortedToHigh = data.slice().sort((a, b) => a.price - b.price);

  renderCard(sortedToHigh);
};
const sortToLow = (data) => {
  const sortedToLow = data.slice().sort((a, b) => b.price - a.price);

  renderCard(sortedToLow);
};
const sortAndFilterData = (data) => {
  let filteredData = data.slice();

  for (const filterType in currentFilters) {
    if (currentFilters[filterType]) {
      const filterFunction = filterFunctions[filterType];
      const filterValue = currentFilters[filterType];
      filteredData = filteredData.filter((item) =>
        filterFunction(item, filterValue)
      );
    }
  }
  if (selectValue) {
    if (selectValue.textContent === "Low to High") {
      filteredData.sort((a, b) => a.price - b.price);
    } else {
      filteredData.sort((a, b) => b.price - a.price);
    }
  }

  renderCard(filteredData);
  updateNoMatchMessage(filteredData.length === 0);

};

const shotByPrice = (data) => {
  if (select) {
    const selectBtn = select.querySelector(".properties__filter-btn");
    selectBtn.style.transform = "rotate(-180deg)";
    select.addEventListener("click", () => {
      selectOtions.classList.toggle("properties__select-options-none");
      if (!selectOtions.classList.contains("properties__select-options-none")) {
        selectBtn.style.transform = "rotate(0deg)";
      } else {
        selectBtn.style.transform = "rotate(-180deg)";
      }
    });
    selectOption.addEventListener("click", () => {
      if (selectValue.textContent === "Low to High") {
        selectValue.textContent = "High to Low";
        selectOption.textContent = "Low to High";
      } else {
        selectValue.textContent = "Low to High";
        selectOption.textContent = "High to Low";
      }
      sortAndFilterData(data);
    });
  }
};

class Validator {
  constructor(name, email, phone) {
    this.name = name;
    this.email = email;
    this.phone = phone;
  }
}
const validate = new Validator("name", "email", "phone");

let isNameValid = false;
let isEmailValid = false;
let isPhoneValid = false;

const checkName = (form) => {
  const user = form.querySelector("#username");
  validate.name = user.value;
  if (user.value === "") {
    createError(user, "Сannot be empty!");
  } else {
    removeError(user);
  }
  if (user.value !== "") {
    if (user.value.length < 3) {
      createError(user, "Min number of characters 3!");
    } else {
      removeError(user);
      isNameValid = true;
    }
    checkSpaces(user);
  }
};
const checkPhone = (form) => {
  const phone = form.querySelector("#phone");
  validate.phone = phone.value;
  if (phone.value === "") {
    createError(phone, "Сannot be empty!");
  } else {
    removeError(phone);
  }
  function isPhone(phone) {
    return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
      phone
    );
  }
  if (phone.value !== "") {
    if (!isPhone(phone.value)) {
      createError(phone, "Invalid phone!");
    } else {
      removeError(phone);
      isPhoneValid = true;
    }
    checkSpaces(phone);
  }
};
const checkEmail = (form) => {
  const email = form.querySelector("#email");
  validate.email = email.value;
  if (email.value === "") {
    createError(email, "Сannot be empty!");
  } else {
    removeError(email);
  }
  function isEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email
    );
  }
  if (email.value !== "") {
    if (!isEmail(email.value)) {
      createError(email, "Invalid email!");
    } else {
      removeError(email);
      isEmailValid = true;
    }
    checkSpaces(email);
  }
};
function clearFormFields(form) {
  const user = form.querySelector("#username");
  const email = form.querySelector("#email");
  const phone = form.querySelector("#phone");

  user.value = "";
  email.value = "";
  phone.value = "";
}
document.addEventListener("DOMContentLoaded", function () {
  const form1 = document.querySelector("#form1");

  if (form1) {
    form1.addEventListener("submit", (e) => {
      e.preventDefault();
      checkName(form1);
      checkEmail(form1);
      checkPhone(form1);

      if (isNameValid && isEmailValid && isPhoneValid) {
        sendForm();
        clearFormFields(form1);
      }
    });
  }

  document.addEventListener("submit", function (e) {
    if (e.target.id === "form2") {
      e.preventDefault();
      checkName(e.target);
      checkEmail(e.target);
      checkPhone(e.target);

      if (isNameValid && isEmailValid && isPhoneValid) {
        sendForm();
        clearFormFields(e.target);
      }
    }
  });
});

function removeError(input) {
  const parent = input.parentNode;
  const showError = parent.querySelector(".error");
  showError.innerText = "";
}
function createError(input, message) {
  const parent = input.parentNode;
  const showError = parent.querySelector(".error");
  showError.innerText = message;
}
function checkSpaces(name) {
  let spaces = /^\S*$/;
  if (name.value.match(spaces)) {
  } else {
    createError(name, "Must be without spaces");
  }
}

const sendForm = () => {
  const popup = document.querySelector(".popup");
  const closeButton = document.querySelector(".popup__content-btn");
  const popupOverlay = document.querySelector(".popup-background ");
  popup.style.display = "block";
  popupOverlay.style.display = "block";
  closeButton.addEventListener("click", function () {
    popup.style.display = "none";
    popupOverlay.style.display = "none";
    isNameValid = false;
    isEmailValid = false;
    isPhoneValid = false;
  });
};

var descriptions = document.querySelectorAll(".main__filter-item--li_value");

descriptions.forEach(function (description) {
  description.addEventListener("click", function (e) {
    const category =
      e.target.parentNode.parentNode.getAttribute("data-category");
    if (category == "property") {
      const propertyValue = e.target.innerHTML;
      currentFilters = {
        price: null,
        bathrooms: null,
        bedrooms: null,
        categories: propertyValue,
        types: null,
        locations: null,
      };
      localStorage.setItem("currentFilters", JSON.stringify(currentFilters));
      localStorage.setItem("checkboxState_categories", true);

      window.location.href = "properties.html";
    }
    if (category == "location") {
      const locationValue = e.target.innerHTML;
      currentFilters = {
        price: null,
        bathrooms: null,
        bedrooms: null,
        categories: null,
        types: null,
        locations: locationValue,
      };
      localStorage.setItem("currentFilters", JSON.stringify(currentFilters));
      localStorage.setItem("checkboxState_locations", true);
      window.location.href = "properties.html";
    }
  });
});
getItems();

const btn = document.querySelector(".header__burger-button");
const menu = document.querySelector(".header__menu");
const propertiesBtnClose = document.querySelector(".properties__btn-close");
btn.addEventListener("click", () => {
  btn.classList.toggle("active");
  menu.classList.toggle("active");
});

const propertiesFilters = document.querySelector(".properties__filter");
const filterBtn = document.querySelector(".properties__filter-inner");
if (filterBtn) {
  filterBtn.addEventListener("click", () => {
    propertiesFilters.classList.add("active");
  });
  propertiesBtnClose.addEventListener("click", () => {
    propertiesFilters.classList.remove("active");
  });
}
if (propertiesFilters) {
  document.addEventListener("click", (e) => {
    if (
      propertiesFilters.classList.contains("active") &&
      e.target !== filterBtn &&
      e.target !== propertiesFilters
    ) {
      propertiesFilters.classList.remove("active");
    }
  });
}
if (propertiesFilters) {
  propertiesFilters.addEventListener("click", (e) => {
    e.stopPropagation();
  });
}

const mainFilter = document.querySelectorAll(".main__filter-item");

mainFilter.forEach((item) => {
  const list = item.querySelector(".main__filter-item--list");
  item.addEventListener("click", () => {
    const isActive = list.classList.contains("main__filter-active");

    if (isActive) {
      list.classList.remove("main__filter-active");
    } else {
      mainFilter.forEach((otherItem) => {
        const otherList = otherItem.querySelector(".main__filter-item--list");
        if (
          otherItem !== item &&
          otherList.classList.contains("main__filter-active")
        ) {
          otherList.classList.remove("main__filter-active");
        }
      });

      list.classList.add("main__filter-active");
    }
  });
  list.addEventListener("click", (event) => {
    event.stopPropagation();
  });
});
if (mainFilter) {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!target.closest(".main__filter-item")) {
      mainFilter.forEach((item) => {
        const list = item.querySelector(".main__filter-item--list");
        if (list.classList.contains("main__filter-active")) {
          list.classList.remove("main__filter-active");
        }
      });
    }
  });
}
