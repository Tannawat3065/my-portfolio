// ------------------ ตัวแปร ------------------
const modal = document.getElementById('modal');
const openBtn = document.getElementById('openModalBtn');
const productForm = document.getElementById('productForm');
const productGrid = document.getElementById('productGrid');

const detailModal = document.getElementById('detailModal');
const detailName = document.getElementById('detailName');
const detailPrice = document.getElementById('detailPrice');
const detailDescription = document.getElementById('detailDescription');
const chatBtn = document.getElementById('chatBtn');

const searchInput = document.getElementById('searchInput');

// ------------------ Modal เพิ่มสินค้า ------------------
openBtn.onclick = () => modal.classList.remove('hidden');
function closeModal() {
  modal.classList.add('hidden');
}

// ------------------ ฟอร์มเพิ่มสินค้า ------------------
productForm.onsubmit = (e) => {
  e.preventDefault();

  const data = new FormData(productForm);
  const name = data.get('name');
  const price = data.get('price');
  const description = data.get('description');
  const chatLink = data.get('chatLink');
  const tag = data.get('productTag');
  const types = data.getAll('type');

  // ✅ แก้ตรงนี้
  const imageInput = productForm.querySelector('input[name="images"]');
  const images = Array.from(imageInput.files);

  const imageReaders = images.map(image => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(image);
    });
  });

  Promise.all(imageReaders).then(imageURLs => {
    const productData = {
      name,
      price,
      description,
      chatLink,
      tag,
      types,
      images: imageURLs
    };

    const card = document.createElement('div');
    card.className = "product-card bg-white shadow rounded-xl overflow-hidden border border-gray-200 cursor-pointer";
    card.setAttribute('data-tag', tag);

    let tagColor = '#3B82F6';
    if (tag === 'ชุดคอสเพลย์หญิง') tagColor = '#EC4899';
    else if (tag === 'ชุดมาสคอต') tagColor = '#8B5CF6';

    const typeTagsHTML = types.map(type => {
      const bgColor = type === 'ขาย' ? '#FACC15' : '#10B981';
      return `
        <span class="text-sm text-white px-2 py-1 rounded-full text-center inline-block min-w-[3.5rem]" style="background-color: ${bgColor};">
          ${type}
        </span>`;
    }).join('');

    card.innerHTML = `
      <div class="w-full h-72 overflow-hidden">
        <img src="${imageURLs[0]}" alt="product image" class="w-full h-full object-cover" />
      </div>

      <div class="flex flex-wrap items-center gap-1 mt-2 ml-2">
        <span class="text-sm text-white px-2 py-1 rounded-full" style="background-color: ${tagColor};">
          ${tag}
        </span>
        ${typeTagsHTML}
      </div>

      <div class="text-lg font-semibold p-2 product-name">${name}</div>
      <div class="text-orange-500 font-bold p-2">${price} บาท</div>
      <div class="hidden product-description">${description}</div>
    `;

    card.onclick = () => openDetailModal(productData);
    productGrid.appendChild(card);
    closeModal();
    productForm.reset();
  });
};

// ------------------ Modal แสดงรายละเอียดสินค้า ------------------
let currentImageIndex = 0;
let currentImages = [];

function openDetailModal(product) {
  detailName.textContent = product.name;
  detailPrice.textContent = `${product.price} บาท`;
  detailDescription.textContent = product.description;

  const message = encodeURIComponent(
    `สวัสดีค่ะ สนใจสินค้านี้ค่ะ\n\n📌 ชื่อ: ${product.name}\n💰 ราคา: ${product.price} บาท\n📝 รายละเอียด: ${product.description}`
  );
  chatBtn.href = `${product.chatLink}?text=${message}`;

  currentImages = product.images || [];
  currentImageIndex = 0;
  renderCarouselImage();
  detailModal.classList.remove('hidden');
}

function closeDetailModal() {
  detailModal.classList.add('hidden');
}

function renderCarouselImage() {
  const imageArea = document.getElementById('detailImage');
  if (!currentImages.length) {
    imageArea.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gray-100 rounded">ไม่มีรูปภาพ</div>`;
    return;
  }

  imageArea.innerHTML = `
    <img src="${currentImages[currentImageIndex]}" class="w-full h-full object-cover rounded" />
    <button onclick="prevImage()" class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 px-2 py-1 rounded">←</button>
    <button onclick="nextImage()" class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 px-2 py-1 rounded">→</button>
  `;
}

function nextImage() {
  if (currentImages.length === 0) return;
  currentImageIndex = (currentImageIndex + 1) % currentImages.length;
  renderCarouselImage();
}

function prevImage() {
  if (currentImages.length === 0) return;
  currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
  renderCarouselImage();
}

// ------------------ ระบบกรองสินค้า ------------------
document.querySelectorAll('.tag-btn').forEach(button => {
  button.addEventListener('click', () => {
    const selectedTag = button.getAttribute('data-tag');
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
      const cardTag = card.getAttribute('data-tag');
      if (selectedTag === 'all' || cardTag === selectedTag) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ------------------ ระบบค้นหาสินค้า ------------------
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const productCards = document.querySelectorAll('.product-card');

  productCards.forEach(card => {
    const name = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
    const description = card.querySelector('.product-description')?.textContent.toLowerCase() || '';
    if (name.includes(searchTerm) || description.includes(searchTerm)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
});
