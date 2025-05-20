const STRAPI_POPULAR_URL = "https://gm-cms-production.up.railway.app";

// Función para obtener los datos de las categorías populares
async function fetchPopularCategoriesData() {
  try {
    const response = await fetch(
      `${STRAPI_POPULAR_URL}/api/mas-vendidas?populate=imagenes`
    );
    if (!response.ok) {
      throw new Error("Error al obtener datos de categorías populares");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error en fetchPopularCategoriesData:", error);
    return null;
  }
}

// Función para renderizar el slider de categorías populares
async function renderPopularCategoriesSlider() {
  const sliderContainer = document.querySelector(".category-slider-one");
  if (!sliderContainer) {
    console.error("Contenedor .category-slider-one no encontrado.");
    return;
  }

  sliderContainer.innerHTML = ""; // Limpiar el contenedor

  const popularCategories = await fetchPopularCategoriesData();

  if (!popularCategories || popularCategories.length === 0) {
    console.error(
      "No se encontraron datos para el slider de categorías populares."
    );

    sliderContainer.innerHTML =
      "<p>No hay categorías populares para mostrar en este momento.</p>";
    return;
  }

  popularCategories.forEach((item) => {
    const imageUrl =
      item.imagenes && item.imagenes.url
        ? item.imagenes.url
        : "assets/images/default-category.png";
    const altText =
      item.imagenes && (item.imagenes.alternativeText || item.imagenes.name)
        ? item.imagenes.alternativeText || item.imagenes.name
        : "Imagen de categoría popular";

    const categoryLink = "shops.html";

    const categoryItemHTML = `
      <div class="category-item style-one text-center">
        <div class="category-img">
          <img src="${imageUrl}" alt="${altText}" />
        </div>
        <div class="category-content">
          <a href="${categoryLink}" class="category-btn">Compra ahora</a>
        </div>
      </div>
    `;
    sliderContainer.innerHTML += categoryItemHTML;
  });

  // Reinicializar el slider Slick para las categorías populares
  if (typeof $ !== "undefined" && $.fn.slick) {
    const $categorySlider = $(".category-slider-one");
    if ($categorySlider.hasClass("slick-initialized")) {
      $categorySlider.slick("unslick");
    }

    $categorySlider.slick({
      dots: true,
      arrows: true,
      infinite: true,
      speed: 300, // Velocidad de la transición entre slides
      autoplay: false, // Desactivamos el autoplay
      slidesToShow: 3,
      slidesToScroll: 1,
      appendArrows: $(".category-arrows.style-one"),

      prevArrow:
        '<button type="button" class="slick-prev"><span class="arrow-dot"></span><i class="fas fa-chevron-left"></i></button>',
      nextArrow:
        '<button type="button" class="slick-next"><span class="arrow-dot"></span><i class="fas fa-chevron-right"></i></button>',
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 2,
          },
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 1,
          },
        },
      ],
    });
  } else {
    console.error(
      "Slick Carousel no está cargado o jQuery no está definido para .category-slider-one."
    );
  }
}

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  renderPopularCategoriesSlider();
});
