document.addEventListener("DOMContentLoaded", function () {
  const strapiUrl = "https://gm-cms-production.up.railway.app"; 
 
const productsApiEndpoint = "/api/productos";
const productContainer = document.getElementById("product-list-container");

if (!productContainer) {
  console.error(
    "El contenedor de productos (#product-list-container) no fue encontrado en el DOM."
  );
  return;
}

async function fetchAllProducts() {
  const pageSize = 1000; 
  let page = 1;
  let allProducts = [];
  let totalPages = 1;

  try {
    do {
      const response = await fetch(
        `${strapiUrl}${productsApiEndpoint}?populate=imagenes&pagination[page]=${page}&pagination[pageSize]=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(
          `Error al obtener los productos de Strapi. Código HTTP: ${response.status}`
        );
      }

      const jsonData = await response.json();
      const products = jsonData.data;
      const meta = jsonData.meta.pagination;

      if (products && products.length > 0) {
        allProducts = [...allProducts, ...products];
      }

      totalPages = meta.pageCount;
      page++;
    } while (page <= totalPages);

    if (allProducts.length === 0) {
      productContainer.innerHTML =
        "<p>No hay productos disponibles en este momento.</p>";
      return;
    }

    renderProducts(allProducts);
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    productContainer.innerHTML =
      "<p>Hubo un error al cargar los productos. Por favor, inténtalo de nuevo más tarde.</p>";
  }
}

  function renderProducts(products) {
    productContainer.innerHTML = ""; // Limpiar cualquier contenido estático o de carga

    products.forEach((product) => {
      const productId = product.documentId;
      const productTitle = product.titulo || "Nombre del Producto";
      const productPrice =
       typeof product.precio === "number" &&!isNaN(product.precio)
        ? `${product.precio.toLocaleString()}`
        : "";

      // Tomar la URL de la primera imagen del array 'imagenes'
      let imageUrl = "assets/images/products/default-placeholder.png"; // Imagen por defecto
      if (
        product.imagenes &&
        product.imagenes.length > 0 &&
        product.imagenes[0].url
      ) {
        imageUrl = product.imagenes[0].url;
      }

      const productDetailUrl = `shop-details.html?id=${productId}`;

      const productItemHTML = `
                <div class="col-xl-4 col-md-6 col-sm-12">
                  <div class="product-item style-one mb-40"> 
                    <div class="product-thumbnail">
                      <img src="${imageUrl}" alt="${productTitle}" />                  
                      <div class="hover-content">                       
                        <a href="${imageUrl}" class="img-popup icon-btn"><i class="fa fa-eye"></i></a>
                      </div>
                      <div class="cart-button">
                      </div>
                    </div>
                    <div class="product-info-wrap">
                      <div class="product-info">
                        <ul class="ratings rating5">
                          <li><i class="fas fa-star"></i></li>
                          <li><i class="fas fa-star"></i></li>
                          <li><i class="fas fa-star"></i></li>
                          <li><i class="fas fa-star"></i></li>
                          <li><i class="fas fa-star"></i></li>
                          <li><a href="#">(80)</a></li>
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
      productContainer.insertAdjacentHTML("beforeend", productItemHTML);
    });

    // Re-inicializar Magnific Popup para los nuevos elementos .img-popup si es necesario
    if (typeof jQuery !== "undefined" && jQuery.fn.magnificPopup) {
      jQuery(".img-popup").magnificPopup({
        type: "image",
        gallery: {
          enabled: true, // Habilita la galería si hay múltiples imágenes con .img-popup
        },
      });
    }
  }

 fetchAllProducts();
});
