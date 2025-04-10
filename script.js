// --- Configuration ---
const CART_STORAGE_KEY = 'sestoCart';

// --- DOM Elements ---
const imageModalElement = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('imageModalLabel'); 
const modalDescription = document.getElementById('modalDescription'); 
const btnPrint = document.getElementById('btnModalPrint');
const btnTshirt = document.getElementById('btnModalTshirt');
const btnCap = document.getElementById('btnModalCap');
const cartModalElement = document.getElementById('cartModal');
const cartCountBadge = document.getElementById('cart-count');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotalSpan = document.getElementById('cartTotal');
const emptyCartMsg = document.getElementById('emptyCartMsg');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn'); 
const checkoutBtnText = checkoutBtn ? checkoutBtn.querySelector('.checkout-text') : null;
const checkoutSpinner = checkoutBtn ? checkoutBtn.querySelector('.checkout-spinner') : null;

// --- Cart State ---
let cart = [];

// --- Functions ---

/**
 * Loads the cart from localStorage when the page loads.
 */
function loadCart() { 
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    cart = storedCart ? JSON.parse(storedCart) : [];
    updateCartDisplay();
}

/**
 * Saves the current cart array to localStorage.
 */
function saveCart() { 
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

/**
 * Adds an item object to the cart array.
 * @param {object} item - The item object to add (should include type, name, price, image).
 */
function addToCart(item) { 
    item.id = Date.now() + Math.random(); // Simple unique ID
    // Ensure image source is set, default if not found
    item.image = item.image || 'https://placehold.co/50x50/cccccc/000000?text=?'; 
    
    cart.push(item);
    console.log('Added to cart:', item);
    saveCart();
    updateCartDisplay();
}

/**
 * Removes an item from the cart array by its unique ID.
 * @param {number|string} itemId - The unique ID of the item to remove.
 */
function removeFromCart(itemId) { 
    console.log('Removing item with ID:', itemId);
    const idToRemove = parseFloat(itemId); // Ensure it's a number for comparison
    cart = cart.filter(item => item.id !== idToRemove);
    saveCart();
    updateCartDisplay();
}

/**
 * Clears all items from the cart array.
 */
function clearCart() { 
    cart = [];
    saveCart();
    updateCartDisplay();
}

/**
 * Updates the cart UI: badge count, modal list, total price.
 */
function updateCartDisplay() { 
    // Update cart icon badge
    if (cartCountBadge) {
        if (cart.length > 0) {
            cartCountBadge.textContent = cart.length;
            cartCountBadge.style.display = 'inline-block';
        } else {
            cartCountBadge.style.display = 'none';
        }
    }

    // Update cart modal content
    if (cartItemsList && cartTotalSpan && emptyCartMsg) {
         cartItemsList.innerHTML = ''; // Clear previous items
         let total = 0;
         if (cart.length === 0) {
             emptyCartMsg.style.display = 'block'; // Show empty message
         } else {
             emptyCartMsg.style.display = 'none'; // Hide empty message
             cart.forEach(item => {
                 total += parseFloat(item.price || 0);
                 const li = document.createElement('li');
                 const imageSrc = item.image || 'https://placehold.co/50x50/cccccc/000000?text=?'; 
                 const displayName = item.name || 'Sesto'; 
                 // Create list item HTML with thumbnail
                 li.innerHTML = `
                     <img src="${imageSrc}" alt="${displayName}" class="cart-item-thumbnail"> 
                     <div class="cart-item-details">
                         <strong>${item.type || 'Article'}</strong> - ${displayName} 
                         ($${parseFloat(item.price || 0).toFixed(2)})
                     </div>
                     <button class="btn btn-sm btn-outline-danger remove-item-btn" data-item-id="${item.id}">X</button>
                 `;
                 cartItemsList.appendChild(li);
             });
         }
         // Update total price display
         cartTotalSpan.textContent = total.toFixed(2);
    }
}

// --- Event Listeners ---

// Populate Image Modal & Set Button Data when image modal is shown
if (imageModalElement) { 
  imageModalElement.addEventListener('show.bs.modal', event => {
    const triggerElement = event.relatedTarget; // The image that was clicked
    const imgSrc = triggerElement.getAttribute('data-img-src');
    const imgName = triggerElement.getAttribute('data-img-name'); 
    const imgDesc = triggerElement.getAttribute('data-img-desc'); // Get description

    // Update modal content
    if (modalTitle) modalTitle.textContent = imgName || 'Image Sesto'; 
    if (modalImage) {
      modalImage.src = imgSrc || ''; 
      modalImage.alt = imgName ? `Image agrandie de ${imgName}` : 'Image agrandie';
    }
    if (modalDescription) { 
        modalDescription.textContent = imgDesc || ''; 
    }
    // Store data on buttons needed for adding to cart
    if(imgName && imgSrc) { 
        if (btnPrint) { btnPrint.setAttribute('data-sesto-name', imgName); btnPrint.setAttribute('data-img-src', imgSrc); }
        if (btnTshirt) { btnTshirt.setAttribute('data-sesto-name', imgName); btnTshirt.setAttribute('data-img-src', imgSrc); }
        if (btnCap) { btnCap.setAttribute('data-sesto-name', imgName); btnCap.setAttribute('data-img-src', imgSrc); }
    }
  });

  // Clear Image Modal content when it's hidden
   imageModalElement.addEventListener('hide.bs.modal', event => {
       if (modalImage) modalImage.src = ''; 
       if (modalDescription) modalDescription.textContent = ''; 
       // Clear stored data from buttons
       if (btnPrint) { btnPrint.removeAttribute('data-sesto-name'); btnPrint.removeAttribute('data-img-src'); }
       if (btnTshirt) { btnTshirt.removeAttribute('data-sesto-name'); btnTshirt.removeAttribute('data-img-src'); }
       if (btnCap) { btnCap.removeAttribute('data-sesto-name'); btnCap.removeAttribute('data-img-src'); }
   });
} else { console.error("Image Modal element #imageModal not found."); }

// Add to Cart Button Clicks (using event delegation on image modal footer)
const imageModalFooter = document.querySelector('#imageModal .modal-footer');
if (imageModalFooter) { 
    imageModalFooter.addEventListener('click', (event) => {
        const targetButton = event.target.closest('.btn'); 
        // Check if it's an add-to-cart button
        if (targetButton && targetButton.hasAttribute('data-product-type')) {
            event.preventDefault(); // Prevent default link behavior
            const productType = targetButton.getAttribute('data-product-type');
            const price = targetButton.getAttribute('data-price');
            const sestoName = targetButton.getAttribute('data-sesto-name'); // Get name stored on button
            const specificImgSrc = targetButton.getAttribute('data-img-src'); // Get specific src stored on button
            
            if (sestoName && specificImgSrc) { 
                // Add item with all details to cart
                addToCart({ type: productType, name: sestoName, price: price, image: specificImgSrc }); 
                
                // Visual feedback on button
                const originalText = targetButton.textContent;
                targetButton.textContent = 'Ajouté!';
                targetButton.disabled = true; 
                setTimeout(() => { 
                    targetButton.textContent = originalText; 
                    targetButton.disabled = false; 
                }, 1500); // Reset after 1.5 seconds
            } else { console.error("Sesto name or image source not found on button for adding to cart."); }
        }
    });
}

// Cart Modal: Remove Item Button Clicks (using event delegation)
 if (cartItemsList) { 
     cartItemsList.addEventListener('click', (event) => {
         const removeButton = event.target.closest('.remove-item-btn');
         if (removeButton) {
             const itemId = removeButton.getAttribute('data-item-id');
             removeFromCart(itemId);
         }
     });
 }

// Cart Modal: Clear Cart Button
if (clearCartBtn) { 
    clearCartBtn.addEventListener('click', clearCart);
}

// Cart Modal: Checkout Button - Fake Progress Logic (message on button)
if (checkoutBtn && clearCartBtn && checkoutBtnText && checkoutSpinner) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Votre panier est vide !'); 
            return; 
        }

        // Disable buttons and show spinner
        checkoutBtn.disabled = true;
        clearCartBtn.disabled = true;
        checkoutBtnText.style.display = 'none';
        checkoutSpinner.style.display = 'inline-block';
        
        // Simulate processing time 
        setTimeout(() => { 
            // Hide spinner, show Sesto message ON the button
            checkoutSpinner.style.display = 'none';
            checkoutBtnText.innerHTML = 'Ben non, t\'es juste un sesto 🙃😘'; 
            checkoutBtnText.style.display = 'inline-block'; 
                                              
            // Set a timeout to reset the button after showing the message
            setTimeout(() => {
                checkoutBtnText.textContent = 'Passer la commande'; // Reset text
                checkoutBtn.disabled = false; // Re-enable buttons
                clearCartBtn.disabled = false;
            }, 3500); // Show message for 3.5 seconds

        }, 2500); // Simulate 2.5 second processing time
    });
} else {
    console.error("Required elements for checkout simulation not found.");
}

// --- Initial Load ---
// Load cart content when the page is fully loaded
document.addEventListener('DOMContentLoaded', loadCart);

console.log('Page loaded! Cart script ready.');

