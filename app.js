/**
 * WARDROBE MVP - Full Control Controller
 * Implements:
 * 1. Windows Photos-style layout sorters (River vs. Square, and Small, Medium, Large)
 * 2. Visual Fullscreen Lightbox Scroller for scrolling across Outfits and Pieces
 * 3. Collection Deletion via Three-Dot popup menus with cascading un-associations
 * 4. Reactive synchronization in Collection Assignment checkboxes
 */

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
const DOM = {
  // Navigation Tabs
  logoBtn: document.getElementById('logo-btn'),
  tabGallery: document.getElementById('tab-gallery'),
  tabUpload: document.getElementById('tab-upload'),
  
  // Views
  galleryView: document.getElementById('gallery-view'),
  uploadView: document.getElementById('upload-view'),
  detailView: document.getElementById('detail-view'),
  
  // Gallery Section & Collections Carousel
  galleryGrid: document.getElementById('gallery-grid'),
  outfitCountBadge: document.getElementById('outfit-count-badge'),
  collectionsCarousel: document.getElementById('collections-carousel'),
  addCollectionBtn: document.getElementById('add-collection-btn'),
  filterBar: document.getElementById('filter-bar'),
  filterCollectionName: document.getElementById('filter-collection-name'),
  clearFilterBtn: document.getElementById('clear-filter-btn'),
  
  // Windows Photos Layout Toolbar Elements
  layoutBtnRiver: document.getElementById('layout-btn-river'),
  layoutBtnSquare: document.getElementById('layout-btn-square'),
  sizeBtnSmall: document.getElementById('size-btn-small'),
  sizeBtnMedium: document.getElementById('size-btn-medium'),
  sizeBtnLarge: document.getElementById('size-btn-large'),
  
  // Upload Form Section
  outfitNameInput: document.getElementById('outfit-name-input'),
  draftItemsSection: document.getElementById('draft-items-section'),
  draftItemsGrid: document.getElementById('draft-items-grid'),
  partCategorySelect: document.getElementById('part-category-select'),
  dropzone: document.getElementById('dropzone'),
  dropzoneDefault: document.getElementById('dropzone-default'),
  fileInput: document.getElementById('file-input'),
  previewContainer: document.getElementById('preview-container'),
  imagePreview: document.getElementById('image-preview'),
  removePreviewBtn: document.getElementById('remove-preview-btn'),
  addPieceDraftBtn: document.getElementById('add-piece-draft-btn'),
  
  // Form Actions
  cancelUploadBtn: document.getElementById('cancel-upload-btn'),
  saveOutfitBtn: document.getElementById('save-outfit-btn'),
  btnSpinner: document.getElementById('btn-spinner'),
  btnText: document.getElementById('btn-text'),
  
  // Detail Outfit Showcase Page
  detailBackBtn: document.getElementById('detail-back-btn'),
  detailOutfitTitle: document.getElementById('detail-outfit-title'),
  detailOutfitDate: document.getElementById('detail-outfit-date'),
  detailCollectionsList: document.getElementById('detail-collections-list'),
  detailManageCollBtn: document.getElementById('detail-manage-coll-btn'),
  detailDeleteBtn: document.getElementById('detail-delete-btn'),
  detailItemsGrid: document.getElementById('detail-items-grid'),
  
  // Lightbox Fullscreen Elements
  lightboxOverlay: document.getElementById('lightbox-overlay'),
  lightboxCloseBtn: document.getElementById('lightbox-close-btn'),
  lightboxArrowLeft: document.getElementById('lightbox-arrow-left'),
  lightboxArrowRight: document.getElementById('lightbox-arrow-right'),
  lightboxImage: document.getElementById('lightbox-image'),
  lightboxTitle: document.getElementById('lightbox-title'),
  lightboxCounter: document.getElementById('lightbox-counter'),
  
  // Modal Overlays
  collectionModal: document.getElementById('collection-modal'),
  newCollectionName: document.getElementById('new-collection-name'),
  modalCancelBtn: document.getElementById('modal-cancel-btn'),
  modalSaveBtn: document.getElementById('modal-save-btn'),
  
  manageCollectionsModal: document.getElementById('manage-collections-modal'),
  collectionsCheckboxList: document.getElementById('collections-checkbox-list'),
  manageCollCloseBtn: document.getElementById('manage-coll-close-btn'),
  
  // Toast notifications
  toast: document.getElementById('toast-notification')
};

// ==========================================================================
// APPLICATION STATE
// ==========================================================================
let state = {
  outfits: [],               // Array of outfits
  collections: [],           // Array of collections
  draftOutfitItems: [],      // Staged parts in builder form: { id, type, image }
  stagedPieceFile: null,     // Currently selected File to stage
  activeCollectionId: null,  // Active collection ID filter
  currentDetailOutfitId: null, // Selected outfit ID in detail view
  
  // Sorters Sizing preferences (Windows Photos style)
  layoutStyle: 'river',     // 'river' (horizontal scroll) | 'square'
  layoutSize: 'medium',     // 'small' | 'medium' | 'large'
  
  // Lightbox scroller index state
  lightboxItems: [],         // Array of items currently in active lightbox: { title, subtitle, image }
  lightboxIndex: -1,         // Active item index
  
  toastTimeout: null         // Dismissal timer for status alerts
};

// SVG icons list
const ICONS = {
  trash: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,
  checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alertCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
  layers: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  dotsHorizontal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
  zoom: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`
};

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================
function showToast(message, type = 'success') {
  if (state.toastTimeout) {
    clearTimeout(state.toastTimeout);
  }
  DOM.toast.className = `toast show ${type}`;
  const icon = type === 'success' ? ICONS.checkCircle : ICONS.alertCircle;
  DOM.toast.innerHTML = `${icon} <span>${message}</span>`;
  
  state.toastTimeout = setTimeout(() => {
    DOM.toast.classList.remove('show');
  }, 3500);
}

// ==========================================================================
// PERSISTENT STORAGE MANAGEMENT (UPGRADED SCHEMA + MIGRATIONS)
// ==========================================================================
function loadDataFromStorage() {
  try {
    const rawOutfits = localStorage.getItem('wardrobe_outfits');
    const rawCollections = localStorage.getItem('wardrobe_collections');
    
    // Load collection items or build default ones
    if (rawCollections) {
      state.collections = JSON.parse(rawCollections);
    } else {
      state.collections = [
        { id: 'coll_work', name: 'Work Wear', createdAt: new Date().toISOString() },
        { id: 'coll_casual', name: 'Weekend Casual', createdAt: new Date().toISOString() },
        { id: 'coll_seasons', name: 'Summer Faves', createdAt: new Date().toISOString() }
      ];
      localStorage.setItem('wardrobe_collections', JSON.stringify(state.collections));
    }
    
    // Load outfits with schema migrations
    let outfitsList = rawOutfits ? JSON.parse(rawOutfits) : [];
    
    state.outfits = outfitsList.map(outfit => {
      if (outfit.image && !outfit.items) {
        outfit.items = [
          {
            id: 'item_legacy_' + outfit.id,
            type: 'Top',
            image: outfit.image
          }
        ];
        delete outfit.image;
      }
      if (!outfit.collections) {
        outfit.collections = [];
      }
      if (!outfit.name) {
        outfit.name = 'Curated Style';
      }
      return outfit;
    });
    
    // Load layout style and size settings (Windows Photos Preferences)
    state.layoutStyle = localStorage.getItem('wardrobe_layout_style') || 'river';
    state.layoutSize = localStorage.getItem('wardrobe_layout_size') || 'medium';
    
    syncLayoutToolbarUI();
    
  } catch (error) {
    console.error('Error parsing LocalStorage datasets:', error);
    showToast('Failed to load storage data.', 'danger');
    state.outfits = [];
    state.collections = [];
  }
}

function saveDataToStorage() {
  try {
    localStorage.setItem('wardrobe_outfits', JSON.stringify(state.outfits));
    localStorage.setItem('wardrobe_collections', JSON.stringify(state.collections));
  } catch (error) {
    console.error('LocalStorage write error:', error);
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      showToast('Storage full! Delete outfits to save more pieces.', 'danger');
    } else {
      showToast('Could not save outfit data persistently.', 'danger');
    }
  }
}

// ==========================================================================
// PIECE RESIZER & COMPRESSOR ENGINE (MAX 600px, 0.70 Quality)
// ==========================================================================
function compressAndResizePiece(file, maxWidth = 600, maxQuality = 0.70) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        try {
          const compressedData = canvas.toDataURL('image/jpeg', maxQuality);
          resolve(compressedData);
        } catch (e) {
          reject(e);
        }
      };
      
      img.onerror = function() {
        reject(new Error('Invalid image file structure.'));
      };
      img.src = event.target.result;
    };
    reader.onerror = function() {
      reject(new Error('File reading error.'));
    };
    reader.readAsDataURL(file);
  });
}

// ==========================================================================
// SPA VIEW ROUTER
// ==========================================================================
function switchView(targetView, params = {}) {
  window.scrollTo(0, 0);
  
  // Close any stray context menus
  closeAllCollectionMenus();
  
  DOM.tabGallery.classList.remove('active');
  DOM.tabUpload.classList.remove('active');
  
  DOM.galleryView.classList.remove('active');
  DOM.uploadView.classList.remove('active');
  DOM.detailView.classList.remove('active');
  
  if (targetView === 'gallery') {
    DOM.tabGallery.classList.add('active');
    DOM.galleryView.classList.add('active');
    state.currentDetailOutfitId = null;
    
    renderCollections();
    renderGallery();
  } else if (targetView === 'upload') {
    DOM.tabUpload.classList.add('active');
    DOM.uploadView.classList.add('active');
    resetUploadForm();
  } else if (targetView === 'detail') {
    DOM.detailView.classList.add('active');
    if (params.outfitId) {
      state.currentDetailOutfitId = params.outfitId;
      renderDetailView();
    }
  }
}

// ==========================================================================
// WINDOWS PHOTOS STYLE LAYOUT CONTROL BAR
// ==========================================================================
function syncLayoutToolbarUI() {
  // Sync Styles (River vs. Square)
  if (state.layoutStyle === 'river') {
    DOM.layoutBtnRiver.classList.add('active');
    DOM.layoutBtnSquare.classList.remove('active');
  } else {
    DOM.layoutBtnSquare.classList.add('active');
    DOM.layoutBtnRiver.classList.remove('active');
  }
  
  // Sync Sizing Pills
  [DOM.sizeBtnSmall, DOM.sizeBtnMedium, DOM.sizeBtnLarge].forEach(btn => {
    if (btn.getAttribute('data-size') === state.layoutSize) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Apply visual layout classes directly to the DOM Grid
  DOM.galleryGrid.className = `gallery-grid layout-${state.layoutStyle} size-${state.layoutSize}`;
}

function handleLayoutChange(styleType) {
  state.layoutStyle = styleType;
  localStorage.setItem('wardrobe_layout_style', styleType);
  syncLayoutToolbarUI();
  renderGallery(); // Re-trigger cards layout rendering
}

function handleSizeChange(sizeType) {
  state.layoutSize = sizeType;
  localStorage.setItem('wardrobe_layout_size', sizeType);
  syncLayoutToolbarUI();
}

// ==========================================================================
// FULLSCREEN LIGHTBOX SLIDESHOW SCROLLER ENGINE
// ==========================================================================
function openLightbox(mode, itemIndex, detailsOutfitId = null) {
  state.lightboxItems = [];
  state.lightboxIndex = itemIndex;
  
  if (mode === 'outfits') {
    // 1. Gather all active outfits currently displayed in gallery (filtered by active collection)
    let displayOutfits = state.outfits;
    if (state.activeCollectionId) {
      displayOutfits = state.outfits.filter(o => o.collections.includes(state.activeCollectionId));
    }
    
    // Map outfits list
    state.lightboxItems = displayOutfits.map(outfit => {
      const coverImage = outfit.items && outfit.items.length > 0 
        ? outfit.items[0].image 
        : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23eee"/></svg>';
      
      const dateObj = new Date(outfit.createdAt);
      const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      
      return {
        title: outfit.name,
        subtitle: `Outfit cover • Uploaded ${dateStr}`,
        image: coverImage
      };
    });
  } else if (mode === 'pieces' && detailsOutfitId) {
    // 2. Gather all parts within a single outfit (for detailed showcase page zooms)
    const outfit = state.outfits.find(o => o.id === detailsOutfitId);
    if (!outfit || !outfit.items) return;
    
    state.lightboxItems = outfit.items.map((item, idx) => {
      return {
        title: outfit.name,
        subtitle: `Outfit Piece ${idx + 1} of ${outfit.items.length} (${item.type})`,
        image: item.image
      };
    });
  }
  
  if (state.lightboxItems.length === 0) return;
  
  // Show lightbox overlay
  DOM.lightboxOverlay.classList.add('active');
  renderLightboxActiveItem();
}

function renderLightboxActiveItem() {
  if (state.lightboxIndex < 0 || state.lightboxIndex >= state.lightboxItems.length) return;
  
  const currentItem = state.lightboxItems[state.lightboxIndex];
  
  // Update content
  DOM.lightboxImage.src = currentItem.image;
  DOM.lightboxTitle.innerText = currentItem.title;
  DOM.lightboxCounter.innerText = `${currentItem.subtitle} • Staged ${state.lightboxIndex + 1} of ${state.lightboxItems.length}`;
}

function nextLightboxItem() {
  if (state.lightboxItems.length <= 1) return;
  state.lightboxIndex = (state.lightboxIndex + 1) % state.lightboxItems.length;
  renderLightboxActiveItem();
}

function prevLightboxItem() {
  if (state.lightboxItems.length <= 1) return;
  state.lightboxIndex = (state.lightboxIndex - 1 + state.lightboxItems.length) % state.lightboxItems.length;
  renderLightboxActiveItem();
}

function closeLightbox() {
  DOM.lightboxOverlay.classList.remove('active');
  DOM.lightboxImage.src = ''; // Clear source to stop ghost visual renders
}

// ==========================================================================
// MULTI-PART BUILDER LOGIC (UPLOAD VIEW)
// ==========================================================================
function handlePieceFileSelect(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Unsupported format! Choose an image file.', 'danger');
    return;
  }
  
  state.stagedPieceFile = file;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    DOM.imagePreview.src = e.target.result;
    DOM.dropzoneDefault.style.display = 'none';
    DOM.previewContainer.style.display = 'block';
    DOM.addPieceDraftBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

function clearStagedPiece() {
  state.stagedPieceFile = null;
  DOM.fileInput.value = '';
  DOM.imagePreview.src = '';
  DOM.dropzoneDefault.style.display = 'flex';
  DOM.previewContainer.style.display = 'none';
  DOM.addPieceDraftBtn.disabled = true;
}

function resetUploadForm() {
  state.draftOutfitItems = [];
  state.stagedPieceFile = null;
  DOM.outfitNameInput.value = '';
  clearStagedPiece();
  
  DOM.draftItemsSection.style.display = 'none';
  DOM.draftItemsGrid.innerHTML = '';
  
  DOM.saveOutfitBtn.disabled = true;
  DOM.saveOutfitBtn.classList.remove('loading');
  DOM.btnSpinner.style.display = 'none';
  DOM.btnText.innerText = 'Save Complete Outfit';
}

async function addPieceToDraft() {
  if (!state.stagedPieceFile) return;
  
  DOM.addPieceDraftBtn.disabled = true;
  DOM.addPieceDraftBtn.innerText = 'Compressing...';
  
  try {
    const category = DOM.partCategorySelect.value;
    const base64Image = await compressAndResizePiece(state.stagedPieceFile);
    
    state.draftOutfitItems.push({
      id: 'piece_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      type: category,
      image: base64Image
    });
    
    clearStagedPiece();
    DOM.addPieceDraftBtn.innerText = 'Add Piece to Outfit';
    
    renderDraftGrid();
    
    DOM.saveOutfitBtn.disabled = state.draftOutfitItems.length === 0;
    
  } catch (error) {
    console.error('Stage Piece Error:', error);
    showToast('Failed to process piece image.', 'danger');
    DOM.addPieceDraftBtn.disabled = false;
    DOM.addPieceDraftBtn.innerText = 'Add Piece to Outfit';
  }
}

function removePieceFromDraft(id) {
  state.draftOutfitItems = state.draftOutfitItems.filter(item => item.id !== id);
  renderDraftGrid();
  DOM.saveOutfitBtn.disabled = state.draftOutfitItems.length === 0;
}

function renderDraftGrid() {
  DOM.draftItemsGrid.innerHTML = '';
  
  if (state.draftOutfitItems.length === 0) {
    DOM.draftItemsSection.style.display = 'none';
    return;
  }
  
  DOM.draftItemsSection.style.display = 'block';
  
  state.draftOutfitItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'draft-item-card';
    card.setAttribute('data-draft-id', item.id);
    
    card.innerHTML = `
      <img src="${item.image}" alt="${item.type}">
      <span class="draft-item-badge badge-${item.type.toLowerCase()}">${item.type}</span>
      <button class="remove-draft-item-btn" title="Remove piece">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    
    card.querySelector('.remove-draft-item-btn').addEventListener('click', () => {
      removePieceFromDraft(item.id);
    });
    
    DOM.draftItemsGrid.appendChild(card);
  });
}

async function saveOutfit() {
  if (state.draftOutfitItems.length === 0) return;
  
  DOM.saveOutfitBtn.disabled = true;
  DOM.btnSpinner.style.display = 'inline-block';
  DOM.btnText.innerText = 'Saving Look...';
  
  try {
    const nameVal = DOM.outfitNameInput.value.trim();
    const outfitName = nameVal !== '' ? nameVal : 'Curated Look';
    
    const newOutfit = {
      id: 'outfit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: outfitName,
      createdAt: new Date().toISOString(),
      collections: [],
      items: [...state.draftOutfitItems]
    };
    
    state.outfits.unshift(newOutfit);
    saveDataToStorage();
    
    showToast('Outfit saved successfully!');
    
    setTimeout(() => {
      resetUploadForm();
      switchView('gallery');
    }, 400);
    
  } catch (error) {
    console.error('Outfit save error:', error);
    showToast('Could not save complete outfit.', 'danger');
    DOM.saveOutfitBtn.disabled = false;
    DOM.btnSpinner.style.display = 'none';
    DOM.btnText.innerText = 'Save Complete Outfit';
  }
}

// ==========================================================================
// DYNAMIC GALLERY DISPLAY ENGINE & FILTERING
// ==========================================================================
function renderGallery() {
  let outfitsCount = state.outfits.length;
  
  let displayOutfits = state.outfits;
  if (state.activeCollectionId) {
    displayOutfits = state.outfits.filter(o => o.collections.includes(state.activeCollectionId));
    outfitsCount = displayOutfits.length;
  }
  
  DOM.outfitCountBadge.innerText = outfitsCount === 1 ? '1 outfit' : `${outfitsCount} outfits`;
  DOM.galleryGrid.innerHTML = '';
  
  if (outfitsCount === 0) {
    // Reset layout classes when empty so the empty state isn't constrained to the horizontal strip
    DOM.galleryGrid.className = 'gallery-grid';
    
    const filterMessage = state.activeCollectionId 
      ? 'No outfits matching this collection yet. Select "Manage Collections" in any outfit details to add them!'
      : 'Curate your first style. Assemble an outfit by adding pieces to view your visual catalog gallery.';
    
    const emptyStateHTML = `
      <div class="empty-state">
        <div class="empty-icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 20h20"/>
            <path d="M20 20a8 8 0 0 0-16 0"/>
            <path d="M12 20V10"/>
            <path d="M12 10a4 4 0 1 1 8-3.3"/>
          </svg>
        </div>
        <h3>Your wardrobe is empty</h3>
        <p>${filterMessage}</p>
        ${!state.activeCollectionId ? `
        <button class="cta-btn" id="empty-state-cta">
          ${ICONS.plus}
          Add First Outfit
        </button>` : ''}
      </div>
    `;
    DOM.galleryGrid.innerHTML = emptyStateHTML;
    
    if (!state.activeCollectionId) {
      document.getElementById('empty-state-cta').addEventListener('click', () => {
        switchView('upload');
      });
    }
    return;
  }
  
  // Re-apply correct layout classes when outfits exist!
  syncLayoutToolbarUI();
  
  // Render cards in order
  displayOutfits.forEach((outfit, index) => {
    const dateObj = new Date(outfit.createdAt);
    const dateStr = dateObj.toLocaleDateString(undefined, {
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
    
    const coverImage = outfit.items && outfit.items.length > 0 
      ? outfit.items[0].image 
      : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%23eee"/></svg>';
      
    const itemsCount = outfit.items ? outfit.items.length : 0;
    const piecesTag = itemsCount > 1 
      ? `<div class="pieces-count-indicator">${ICONS.layers} <span>${itemsCount} Pieces</span></div>` 
      : '';
      
    const cardElement = document.createElement('article');
    cardElement.className = 'outfit-card';
    cardElement.setAttribute('data-id', outfit.id);
    
    cardElement.innerHTML = `
      <div class="image-container">
        ${piecesTag}
        <img src="${coverImage}" alt="${outfit.name} cover photo" loading="lazy">
        <div class="card-overlay">
          <!-- Windows Photos style Quick Zoom Fullscreen Trigger -->
          <button class="quick-zoom-btn" title="View Fullscreen" aria-label="Open fullscreen slideshow">
            ${ICONS.zoom}
          </button>
        </div>
      </div>
      <div class="card-details">
        <div class="card-meta">
          <span class="card-title">${outfit.name}</span>
          <span class="card-date">${dateStr}</span>
        </div>
        <button class="delete-btn" aria-label="Delete this outfit" title="Delete outfit">
          ${ICONS.trash}
        </button>
      </div>
    `;
    
    // Clicking card opens editorial Detail View (Inner Screen)
    cardElement.addEventListener('click', (e) => {
      if (e.target.closest('.delete-btn') || e.target.closest('.quick-zoom-btn')) return;
      switchView('detail', { outfitId: outfit.id });
    });
    
    // Zoom icon opens Fullscreen Lightbox scroller for OUTFITS
    cardElement.querySelector('.quick-zoom-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox('outfits', index);
    });
    
    // Quick Delete button
    cardElement.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to delete this outfit?')) {
        deleteOutfit(outfit.id);
      }
    });
    
    DOM.galleryGrid.appendChild(cardElement);
  });
  
  // Append an "Add New Outfit" placeholder card at the end of the grid
  const addOutfitCard = document.createElement('article');
  addOutfitCard.className = 'outfit-card add-outfit-card';
  addOutfitCard.innerHTML = `
    <div class="image-container add-outfit-placeholder">
      <div class="add-outfit-inner">
        ${ICONS.plus}
        <span>Add Outfit</span>
      </div>
    </div>
  `;
  addOutfitCard.addEventListener('click', () => {
    switchView('upload');
  });
  DOM.galleryGrid.appendChild(addOutfitCard);
}

function deleteOutfit(id) {
  const card = document.querySelector(`.outfit-card[data-id="${id}"]`);
  
  const performDeletion = () => {
    state.outfits = state.outfits.filter(o => o.id !== id);
    saveDataToStorage();
    
    if (state.currentDetailOutfitId === id) {
      switchView('gallery');
    } else {
      renderGallery();
      renderCollections();
    }
    showToast('Outfit removed successfully.');
  };
  
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(15px) scale(0.95)';
    card.style.transition = 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)';
    setTimeout(performDeletion, 350);
  } else {
    performDeletion();
  }
}

// ==========================================================================
// APPLE-STYLE COLLECTIONS ROW & CONTEXT MENUS
// ==========================================================================
function closeAllCollectionMenus() {
  document.querySelectorAll('.collection-menu').forEach(menu => {
    menu.classList.remove('show');
  });
  document.querySelectorAll('.collection-card').forEach(card => {
    card.classList.remove('menu-open');
  });
}

function renderCollections() {
  DOM.collectionsCarousel.innerHTML = '';
  
  // 1. "All Looks" Card
  const allCount = state.outfits.length;
  const allActive = state.activeCollectionId === null ? 'active' : '';
  
  const allFolderHTML = document.createElement('div');
  allFolderHTML.className = `collection-card ${allActive}`;
  allFolderHTML.innerHTML = `
    <span class="collection-name">All Looks</span>
    <span class="collection-count">${allCount} items</span>
  `;
  
  allFolderHTML.addEventListener('click', (e) => {
    if (e.target.closest('.collection-dots-btn') || e.target.closest('.collection-menu')) return;
    state.activeCollectionId = null;
    DOM.filterBar.style.display = 'none';
    renderCollections();
    renderGallery();
  });
  
  DOM.collectionsCarousel.appendChild(allFolderHTML);
  
  // 2. Loop custom created folders
  state.collections.forEach(coll => {
    const count = state.outfits.filter(o => o.collections.includes(coll.id)).length;
    const isChecked = state.activeCollectionId === coll.id ? 'active' : '';
    
    const folder = document.createElement('div');
    folder.className = `collection-card ${isChecked}`;
    
    folder.innerHTML = `
      <!-- Three-dot menu button to trigger action popups -->
      <button class="collection-dots-btn" title="Collection options">
        ${ICONS.dotsHorizontal}
      </button>
      
      <!-- Popover Menu -->
      <div class="collection-menu">
        <button class="collection-menu-item btn-delete-coll" data-coll-id="${coll.id}">
          ${ICONS.trash} Delete
        </button>
      </div>

      <span class="collection-name">${coll.name}</span>
      <span class="collection-count">${count} items</span>
    `;
    
    // Filter trigger when clicking the card itself
    folder.addEventListener('click', (e) => {
      if (e.target.closest('.collection-dots-btn') || e.target.closest('.collection-menu')) return;
      state.activeCollectionId = coll.id;
      DOM.filterCollectionName.innerText = coll.name;
      DOM.filterBar.style.display = 'flex';
      renderCollections();
      renderGallery();
    });
    
    // Three dot toggle click
    folder.querySelector('.collection-dots-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = folder.querySelector('.collection-menu');
      const isShowing = menu.classList.contains('show');
      
      closeAllCollectionMenus();
      
      if (!isShowing) {
        menu.classList.add('show');
        folder.classList.add('menu-open');
      }
    });
    
    // Delete action inside popover
    folder.querySelector('.btn-delete-coll').addEventListener('click', (e) => {
      e.stopPropagation();
      const collId = e.currentTarget.getAttribute('data-coll-id');
      
      if (confirm(`Are you sure you want to delete the collection "${coll.name}"?\nYour outfits will NOT be deleted, but they will be un-associated from this collection.`)) {
        deleteCollection(collId);
      }
    });
    
    DOM.collectionsCarousel.appendChild(folder);
  });
  
  // 3. "+" Add Folder card
  const plusCard = document.createElement('div');
  plusCard.className = 'collection-card add-card';
  plusCard.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    <span>New Collection</span>
  `;
  
  plusCard.addEventListener('click', () => {
    DOM.newCollectionName.value = '';
    DOM.modalSaveBtn.disabled = true;
    DOM.collectionModal.classList.add('active');
  });
  
  DOM.collectionsCarousel.appendChild(plusCard);
}

function deleteCollection(id) {
  // 1. Remove from Collections state list
  state.collections = state.collections.filter(c => c.id !== id);
  
  // 2. Loop all saved outfits and safely filter out collection association ID
  state.outfits = state.outfits.map(outfit => {
    if (outfit.collections) {
      outfit.collections = outfit.collections.filter(collId => collId !== id);
    }
    return outfit;
  });
  
  // 3. Reset active filters if the currently viewed collection got deleted
  if (state.activeCollectionId === id) {
    state.activeCollectionId = null;
    DOM.filterBar.style.display = 'none';
  }
  
  saveDataToStorage();
  closeAllCollectionMenus();
  renderCollections();
  renderGallery();
  showToast('Collection deleted successfully.');
}

// ==========================================================================
// EDITORIAL DETAIL VIEW (INNER SCREEN CONTROLLER)
// ==========================================================================
function renderDetailView() {
  const outfit = state.outfits.find(o => o.id === state.currentDetailOutfitId);
  if (!outfit) {
    showToast('Outfit not found.', 'danger');
    switchView('gallery');
    return;
  }
  
  DOM.detailOutfitTitle.innerText = outfit.name;
  const dateObj = new Date(outfit.createdAt);
  DOM.detailOutfitDate.innerText = 'Uploaded ' + dateObj.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) + ' at ' + dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  
  // Populates collections pills
  DOM.detailCollectionsList.innerHTML = '';
  const assignedCollections = state.collections.filter(c => outfit.collections.includes(c.id));
  
  if (assignedCollections.length === 0) {
    DOM.detailCollectionsList.innerHTML = '<span class="collection-pill empty-pill">Not assigned to any collections</span>';
  } else {
    assignedCollections.forEach(c => {
      const pill = document.createElement('span');
      pill.className = 'collection-pill';
      pill.innerText = c.name;
      DOM.detailCollectionsList.appendChild(pill);
    });
  }
  
  // Render pieces grid
  DOM.detailItemsGrid.innerHTML = '';
  if (outfit.items && outfit.items.length > 0) {
    outfit.items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'detail-piece-card';
      
      card.innerHTML = `
        <div class="detail-piece-img-box" title="View Fullscreen" data-index="${index}">
          <img src="${item.image}" alt="${item.type}">
        </div>
        <div class="detail-piece-footer">
          <span class="detail-piece-type badge-${item.type.toLowerCase()}">${item.type}</span>
        </div>
      `;
      
      // Clicking a piece opens the Lightbox scrolling across the PIECES OF THIS OUTFIT
      card.querySelector('.detail-piece-img-box').addEventListener('click', () => {
        openLightbox('pieces', index, outfit.id);
      });
      
      DOM.detailItemsGrid.appendChild(card);
    });
  } else {
    DOM.detailItemsGrid.innerHTML = '<p class="empty-hint">No pieces registered under this outfit.</p>';
  }
}

// ==========================================================================
// REACTIVE COLLECTION MANAGEMENT SYNC DRAWERS
// ==========================================================================
function openManageCollectionsModal() {
  const outfit = state.outfits.find(o => o.id === state.currentDetailOutfitId);
  if (!outfit) return;
  
  DOM.collectionsCheckboxList.innerHTML = '';
  
  if (state.collections.length === 0) {
    DOM.collectionsCheckboxList.innerHTML = '<p class="empty-hint">No collections created yet.</p>';
  } else {
    state.collections.forEach(coll => {
      const label = document.createElement('label');
      const isChecked = outfit.collections.includes(coll.id);
      
      label.innerHTML = `
        <input type="checkbox" data-coll-id="${coll.id}">
        <span>${coll.name}</span>
      `;
      
      // Explicitly set the DOM property to guarantee checked values sync perfectly!
      const checkbox = label.querySelector('input');
      checkbox.checked = isChecked;
      
      // Bind toggle change directly
      checkbox.addEventListener('change', (e) => {
        const collId = e.target.getAttribute('data-coll-id');
        if (e.target.checked) {
          if (!outfit.collections.includes(collId)) {
            outfit.collections.push(collId);
          }
        } else {
          outfit.collections = outfit.collections.filter(id => id !== collId);
        }
        
        // Immediate persistence and detail view sync!
        saveDataToStorage();
        renderDetailView();
      });
      
      DOM.collectionsCheckboxList.appendChild(label);
    });
  }
  
  DOM.manageCollectionsModal.classList.add('active');
}

function handleCollectionModalInput(e) {
  const val = e.target.value.trim();
  DOM.modalSaveBtn.disabled = val === '';
}

function createNewCollection() {
  const nameVal = DOM.newCollectionName.value.trim();
  if (nameVal === '') return;
  
  const exists = state.collections.some(c => c.name.toLowerCase() === nameVal.toLowerCase());
  if (exists) {
    showToast('Collection already exists!', 'danger');
    return;
  }
  
  const newColl = {
    id: 'coll_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: nameVal,
    createdAt: new Date().toISOString()
  };
  
  state.collections.push(newColl);
  saveDataToStorage();
  
  DOM.collectionModal.classList.remove('active');
  renderCollections();
  
  showToast(`Collection "${nameVal}" created!`);
}

// ==========================================================================
// DRAG & DROP & EVENT LISTENERS
// ==========================================================================
function setupDragAndDrop() {
  const dropzone = DOM.dropzone;
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    }, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    }, false);
  });
  
  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    handlePieceFileSelect(file);
  }, false);
  
  dropzone.addEventListener('click', (e) => {
    if (e.target.closest('#remove-preview-btn')) return;
    DOM.fileInput.click();
  });
  
  DOM.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handlePieceFileSelect(file);
  });
  
  DOM.removePreviewBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearStagedPiece();
  });
}

function initializeEvents() {
  // Navigation tabs
  DOM.logoBtn.addEventListener('click', () => switchView('gallery'));
  DOM.tabGallery.addEventListener('click', () => switchView('gallery'));
  DOM.tabUpload.addEventListener('click', () => switchView('upload'));
  
  // Gallery Filtering
  DOM.clearFilterBtn.addEventListener('click', () => {
    state.activeCollectionId = null;
    DOM.filterBar.style.display = 'none';
    renderCollections();
    renderGallery();
  });
  
  DOM.addCollectionBtn.addEventListener('click', () => {
    DOM.newCollectionName.value = '';
    DOM.modalSaveBtn.disabled = true;
    DOM.collectionModal.classList.add('active');
  });
  
  // Windows Photos Sorter layout Toolbar clicks
  DOM.layoutBtnRiver.addEventListener('click', () => handleLayoutChange('river'));
  DOM.layoutBtnSquare.addEventListener('click', () => handleLayoutChange('square'));
  DOM.sizeBtnSmall.addEventListener('click', () => handleSizeChange('small'));
  DOM.sizeBtnMedium.addEventListener('click', () => handleSizeChange('medium'));
  DOM.sizeBtnLarge.addEventListener('click', () => handleSizeChange('large'));
  
  // Staging Piece Form Click triggers
  DOM.addPieceDraftBtn.addEventListener('click', addPieceToDraft);
  
  // Upload Save / Cancel
  DOM.cancelUploadBtn.addEventListener('click', () => {
    resetUploadForm();
    switchView('gallery');
  });
  DOM.saveOutfitBtn.addEventListener('click', saveOutfit);
  
  // Details screen
  DOM.detailBackBtn.addEventListener('click', () => switchView('gallery'));
  DOM.detailManageCollBtn.addEventListener('click', openManageCollectionsModal);
  DOM.detailDeleteBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this complete outfit?')) {
      deleteOutfit(state.currentDetailOutfitId);
    }
  });
  
  // Fullscreen Lightbox Arrow Navigation Click Triggers
  DOM.lightboxCloseBtn.addEventListener('click', closeLightbox);
  DOM.lightboxArrowLeft.addEventListener('click', prevLightboxItem);
  DOM.lightboxArrowRight.addEventListener('click', nextLightboxItem);
  
  // Clicking Lightbox Backdrop dims to exit slideshow
  DOM.lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === DOM.lightboxOverlay || e.target.closest('#lightbox-close-btn')) {
      closeLightbox();
    }
  });
  
  // GLOBAL KEYBOARD HANDLERS (ARROW CONTROLS FOR SLIDESHOW)
  window.addEventListener('keydown', (e) => {
    if (!DOM.lightboxOverlay.classList.contains('active')) return;
    
    if (e.key === 'ArrowRight') {
      nextLightboxItem();
    } else if (e.key === 'ArrowLeft') {
      prevLightboxItem();
    } else if (e.key === 'Escape') {
      closeLightbox();
    }
  });
  
  // GLOBAL MOUSE CLICK: Automatically dismiss stray folder context menus
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.collection-card')) {
      closeAllCollectionMenus();
    }
  });
  
  // Create collection modal
  DOM.newCollectionName.addEventListener('input', handleCollectionModalInput);
  DOM.modalCancelBtn.addEventListener('click', () => {
    DOM.collectionModal.classList.remove('active');
  });
  DOM.modalSaveBtn.addEventListener('click', createNewCollection);
  
  // Manage collection sync closure
  DOM.manageCollCloseBtn.addEventListener('click', () => {
    DOM.manageCollectionsModal.classList.remove('active');
  });
  
  setupDragAndDrop();
}

// ==========================================================================
// ENTRY POINT / SYSTEM RUN
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadDataFromStorage();
  initializeEvents();
  renderCollections();
  renderGallery();
});
