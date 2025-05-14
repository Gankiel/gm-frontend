// Configuración de la URL base de Strapi
const STRAPI_URL = "http://localhost:1337";

// Función para obtener los datos del slider 
async function fetchHeroSlider() {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/categorias?populate=imagenes`
    );
    if (!response.ok) {
      throw new Error("Error al obtener datos de categorías");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Función para renderizar el slider 
async function renderHeroSlider() {
  const sliderContainer = document.querySelector(".hero-slider-one");
  if (!sliderContainer) return;

  // Limpiar el contenedor antes de agregar nuevos slides
  sliderContainer.innerHTML = "";

  // Obtener datos del slider desde Strapi
  const categorias = await fetchHeroSlider();

  if (!categorias || categorias.length === 0) {
    console.error("No se encontraron datos de categorías");
    return;
  }

  // Crear HTML para cada slider basado en las categorías
  categorias.forEach((categoria) => {
    // Extraer el texto de la descripción desde la estructura de bloques
    let descripcionTexto = "";
    if (categoria.descripcion && Array.isArray(categoria.descripcion)) {
      categoria.descripcion.forEach((bloque) => {
        if (bloque.children && Array.isArray(bloque.children)) {
          bloque.children.forEach((child) => {
            if (child.text) {
              descripcionTexto += child.text;
            }
          });
        }
      });
    }

    // Obtener la URL de la imagen
    let imageUrl = "assets/images/hero/hero-one_img1.jpg"; // Imagen por defecto
    if (categoria.imagenes && categoria.imagenes.url) {
      // Usar la URL directa de la imagen
      imageUrl = categoria.imagenes.url;
    } else if (
      categoria.imagenes &&
      categoria.imagenes.formats &&
      categoria.imagenes.formats.large
    ) {
      // O usar el formato grande si está disponible
      imageUrl = categoria.imagenes.formats.large.url;
    }

    // Crear el HTML del slider con la estructura exacta del diseño original
    const sliderHTML = `
      <div class="single-hero-slider">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <!--=== Hero Content ===-->
            <div class="hero-content style-one mb-50">
              <span class="sub-heading">La mejor calidad y estampados en DTF</span>
              <h1>
                ${categoria.titulo || "Exclusive Collection"} <br />
                en <span>Tu Tienda</span> 
              </h1>
              <p>
                ${
                  descripcionTexto ||
                  "Discover our exclusive collection available only in our online store. Shop now for unique and premium items that you won't find anywhere else."
                }
              </p>
              <ul>
                <li>
                  <div class="price-box">
                    <div class="currency">$</div>
                    <div class="text">
                      <span class="discount"></span>
                      <h3>${
                        categoria.precio
                          ? categoria.precio.toLocaleString()
                          : "Contactanos"
                      }</h3>
                    </div>
                  </div>
                </li>
                <li>
                  <img src="assets/images/hero/line-1.png" alt="" />
                </li>
                <li>
                  <a
                    href="https://wa.me/+573237564731"
                    class="whatsapp-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      class="whatsapp-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                    >
                      <path
                        fill="currentColor"
                        d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"
                      />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-lg-6">
            <!--=== Hero Image ===-->
            <div class="hero-image-box">
              <div class="hero-image">
                <img
                  src="${imageUrl}"
                  alt="${categoria.titulo || "Hero Image"}"
                />
                <div
                  class="hero-shape bg_cover"
                  style="background-image: url(assets/images/hero/hero-one-shape1.png);"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Agregar el slider al contenedor
    sliderContainer.innerHTML += sliderHTML;
  });

  // Reinicializar el slider después de cargar el contenido

  if (typeof $ !== "undefined" && $.fn.slick) {
    // Primero destruir el slider existente si ya está inicializado
    if ($(".hero-slider-one").hasClass("slick-initialized")) {
      $(".hero-slider-one").slick("unslick");
    }

    // Reinicializar con todas las opciones originales para mantener las animaciones
    var sliderDots = $(".hero-dots");
    var sliderArrows = $(".hero-arrows"); // Definir sliderArrows aquí
    $(".hero-slider-one").slick({
      dots: true,
      arrows: true, // Cambiado a true para mostrar las flechas personalizadas
      infinite: true,
      speed: 800,
      appendArrows: sliderArrows, 
      appendDots: sliderDots,
      autoplay: false,
      vertical: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      prevArrow:
        '<div class="prev"><i class="flaticon-arrow-left"></i><img src="assets/images/hero/arrow-bg.png" alt=""></div>',
      nextArrow:
        '<div class="next"><img src="assets/images/hero/arrow-bg.png" alt=""><i class="flaticon-arrow-right"></i></div>',
      responsive: [
        {
          breakpoint: 1200,
          settings: {
            dots: false,
          },
        },
        {
          breakpoint: 767,
          settings: {
            vertical: false,
          },
        },
      ],
    });
  }
}

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  renderHeroSlider();
});
