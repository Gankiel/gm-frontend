document.addEventListener("DOMContentLoaded", function () {
  const strapiUrl = "https://gm-cms-production.up.railway.app";
  const categoriesApiEndpoint = "/api/tipo-catalogos?populate=image"; // Para listar categorías
  const productsByCategoryBaseApiEndpoint = "/api/tipo-catalogos"; // Para productos de UNA categoría
  const allProductsApiEndpoint = "/api/productos?populate=imagenes"; // Para todos los productos

  const categoriesContainer = document.getElementById(
    "type-categories-container" // Contenedor para el widget de categorías
  );
  const productListContainer = document.getElementById(
    "product-list-container" // Contenedor para la lista de productos en shops.html
  );

  if (!categoriesContainer) {
    console.warn(
      "El contenedor #type-categories-container no fue encontrado en el DOM."
    );
    // No retornamos aquí, ya que productListContainer podría existir para la carga inicial de todos los productos
  }
  if (!productListContainer) {
    console.error(
      "El contenedor #product-list-container no fue encontrado en el DOM. No se podrán mostrar productos."
    );
    return; // Crítico para mostrar productos
  }

  // Función para renderizar productos (ya sea todos o filtrados)
  function renderProducts(products) {
    productListContainer.innerHTML = ""; // Limpiar productos actuales

    if (!products || products.length === 0) {
      productListContainer.innerHTML = "<p>No hay productos para mostrar.</p>";
      return;
    }

    products.forEach((product) => {
      const productId = product.documentId; 
      const productTitle = product.titulo || "Producto sin título";
      const productPrice = product.precio
        ? product.precio.toLocaleString()
        : "N/A";
      let imageUrl = "assets/images/products/default-placeholder.png"; // Placeholder

      if (product.imagenes && product.imagenes.length > 0) {
        const firstImageData = product.imagenes[0].data
          ? product.imagenes[0].data.attributes
          : product.imagenes[0];

        if (firstImageData) { // Asegurarse que firstImageData exista
          if (firstImageData.formats) {
            if (firstImageData.formats.small && firstImageData.formats.small.url) {
              imageUrl = firstImageData.formats.small.url;
            } else if (firstImageData.formats.medium && firstImageData.formats.medium.url) {
              imageUrl = firstImageData.formats.medium.url;
            } else if (firstImageData.url) { // Usar la URL original si small/medium no están en formats
              imageUrl = firstImageData.url;
            } else if (firstImageData.formats.thumbnail && firstImageData.formats.thumbnail.url) {
              imageUrl = firstImageData.formats.thumbnail.url; // Thumbnail como último recurso de formats
            }
          } else if (firstImageData.url) {
            // Si no hay objeto 'formats', usar la URL original directamente
            imageUrl = firstImageData.url;
          }
        }
      }

      // La URL del detalle del producto
      const productDetailUrl = `shop-details.html?id=${productId}`;

      const productItemHTML = `
        <div class="col-xl-4 col-md-6 col-sm-12">
          <div class="product-item style-one mb-40">
            <div class="product-thumbnail">
              <img src="${
                imageUrl.startsWith("http") ? imageUrl : strapiUrl + imageUrl
              }" alt="${productTitle}" />
              <div class="hover-content">
                <a href="${productDetailUrl}" class="icon-btn"><i class="far fa-eye"></i></a>
              </div>
              
            
            
            </div>
            <div class="product-info-wrap">
              <div class="product-info">
                <ul class="ratings rating5"> ${
                  /* Estrellas de calificación (pueden ser dinámicas) */ ""
                }
                  <li><i class="fas fa-star"></i></li>
                  <li><i class="fas fa-star"></i></li>
                  <li><i class="fas fa-star"></i></li>
                  <li><i class="fas fa-star"></i></li>
                  <li><i class="fas fa-star"></i></li>
                  <li><a href="#">(50)</a></li>
                </ul>
                <h4 class="title">
                  <a href="${productDetailUrl}">${productTitle}</a>
                </h4>
              </div>
              <div class="product-price">
                <span class="price new-price"><span class="currency">$</span>${productPrice}</span>
              </div>
            </div>
          </div>
        </div>
      `;
      productListContainer.insertAdjacentHTML("beforeend", productItemHTML);
    });
    // Re-inicializar plugins como Magnific Popup si es necesario para los nuevos elementos
    if (typeof jQuery !== "undefined" && jQuery.fn.magnificPopup) {
      jQuery("#product-list-container .img-popup").magnificPopup({
        // Asegúrate que tus productos tengan .img-popup si lo usas
        type: "image",
        gallery: {
          enabled: true,
        },
      });
    }
  }

  // Función para obtener todos los productos (cuando no hay filtro)
  async function fetchAllProductsToDisplay() {
    try {
      const response = await fetch(`${strapiUrl}${allProductsApiEndpoint}`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const jsonData = await response.json();
      // Asumiendo que jsonData.data es el array de productos
      renderProducts(jsonData.data);
    } catch (error) {
      console.error("Error al cargar todos los productos:", error);
      if (productListContainer)
        productListContainer.innerHTML = "<p>Error al cargar productos.</p>";
    }
  }

  // Función para obtener productos de una categoría específica
  async function fetchProductsForCategory(categoryId) {
    try {
      // El endpoint para obtener una categoría y sus productos poblados
      const response = await fetch(
        `${strapiUrl}${productsByCategoryBaseApiEndpoint}/${categoryId}?populate[productos][populate]=imagenes`
      );
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const jsonData = await response.json();

      // Los productos están dentro de jsonData.data.productos
      if (jsonData.data && jsonData.data.productos) {
        renderProducts(jsonData.data.productos);
      } else {
        renderProducts([]); // Renderiza un mensaje de "no hay productos"
      }
    } catch (error) {
      console.error(
        `Error al cargar productos para la categoría ${categoryId}:`,
        error
      );
      if (productListContainer)
        productListContainer.innerHTML =
          "<p>Error al cargar productos de la categoría.</p>";
    }
  }

  // Función para manejar el clic en un checkbox de categoría
  function handleCategoryClick(event, checkboxes) {
    const clickedCheckbox = event.target;
    const categoryId = clickedCheckbox.dataset.id;

    if (clickedCheckbox.checked) {
      // Desmarcar otros checkboxes
      checkboxes.forEach((cb) => {
        if (cb !== clickedCheckbox) {
          cb.checked = false;
        }
      });
      // Cargar productos de esta categoría
      fetchProductsForCategory(categoryId);
    } else {
      // Si se desmarca y ningún otro está marcado, mostrar todos los productos
      const anyChecked = Array.from(checkboxes).some((cb) => cb.checked);
      if (!anyChecked) {
        fetchAllProductsToDisplay();
      }
    }
  }

  // Función para renderizar las categorías y añadir event listeners
  function renderTypeCategories(categories) {
    if (!categoriesContainer) return; 

    let categoriesHTML = `
      <div class="product-widget product-categories-widget mb-40" data-aos="fade-up" data-aos-delay="20" data-aos-duration="1000">
        <div class="widget-content">
          <h4 class="widget-title">Categorias</h4><br>
          <ul class="categories-list">
            ${categories
              .map((category, index) => {
                const categoryId = category.documentId; 
                const categoryTitle = category.titulo || "Categoría sin título";
                return `
                <li>
                  <div class="form-check">
                    <input class="form-check-input category-checkbox" type="checkbox" id="checkCat${index}" data-id="${categoryId}" />
                    <label class="form-check-label" for="checkCat${index}">
                      ${categoryTitle}
                    </label>
                  </div>
                </li>
              `;
              })
              .join("")}
          </ul>
        </div>
      </div>
    `;
    categoriesContainer.innerHTML = categoriesHTML;

    // Añadir event listeners a los nuevos checkboxes
    const categoryCheckboxes =
      categoriesContainer.querySelectorAll(".category-checkbox");
    categoryCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (event) =>
        handleCategoryClick(event, categoryCheckboxes)
      );
    });
  }

  // Función inicial para cargar las categorías
  async function fetchInitialTypeCategories() {
    if (!categoriesContainer) return; // No intentar cargar categorías si el contenedor no existe
    try {
      const response = await fetch(`${strapiUrl}${categoriesApiEndpoint}`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const jsonData = await response.json();

      if (jsonData.data && jsonData.data.length > 0) {
        renderTypeCategories(jsonData.data);
      } else {
        categoriesContainer.innerHTML =
          "<p>No hay categorías para mostrar.</p>";
      }
    } catch (error) {
      console.error("Error al cargar las categorías:", error);
      categoriesContainer.innerHTML = "<p>Error al cargar las categorías.</p>";
    }
  }

  // Carga inicial
  fetchInitialTypeCategories(); // Carga las categorías en la sidebar
  // fetchAllProductsToDisplay(); // Carga todos los productos inicialmente (si no lo hace otro script como shop-products.js)
  // Si tienes shop-products.js cargando todos los productos al inicio, puedes comentar la línea de arriba.
  // Si este script es el único responsable de cargar productos en shops.html, descoméntala.
  // Por ahora, la dejo comentada asumiendo que otro script podría manejar la carga inicial de todos los productos.
  // Si deseas que este script maneje la carga inicial de todos los productos, asegúrate de que `shop-products.js` no lo haga también para evitar duplicaciones o conflictos.
});
