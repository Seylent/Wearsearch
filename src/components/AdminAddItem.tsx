// AdminAddItem.tsx
import React, { useState } from "react";

const AdminAddItem: React.FC = () => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeTelegram, setStoreTelegram] = useState("");
  const [storeInstagram, setStoreInstagram] = useState("");
  const [storeShipping, setStoreShipping] = useState("");

  const handleAddItem = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      alert("Спочатку залогіньтесь!");
      return;
    }

    try {
      // First, check if store exists or create it
      let storeId: string;
      
      // Check for existing store
      const storesResponse = await fetch('http://localhost:3000/api/stores');
      
      if (!storesResponse.ok) {
        throw new Error('Failed to fetch stores');
      }
      
      const storesResult = await storesResponse.json();
      const stores = storesResult.data || storesResult;
      const existingStore = stores.find((s: any) => s.name === storeName);

      if (existingStore) {
        storeId = existingStore.id;
      } else {
        // Create new store
        const createStoreResponse = await fetch('http://localhost:3000/api/admin/stores', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: storeName,
            telegram_url: storeTelegram || null,
            instagram_url: storeInstagram || null,
            shipping_info: storeShipping || null,
          }),
        });

        if (!createStoreResponse.ok) {
          throw new Error('Failed to create store');
        }

        const newStore = await createStoreResponse.json();
        storeId = newStore.id;
      }

      // Create product with store link
      const createProductResponse = await fetch('http://localhost:3000/api/admin/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          color,
          type,
          price: parseFloat(price),
          description: description || null,
          image_url: imageUrl || null,
          store_ids: [storeId],
        }),
      });

      if (!createProductResponse.ok) {
        const errorData = await createProductResponse.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      alert("Предмет успішно додано!");
      // Clear form after successful addition
      setName("");
      setColor("");
      setType("");
      setPrice("");
      setDescription("");
      setImageUrl("");
      setStoreName("");
      setStoreTelegram("");
      setStoreInstagram("");
      setStoreShipping("");
    } catch (error: any) {
      console.error(error);
      alert("Сталася помилка при додаванні предмету: " + error.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>Додати предмет</h2>
      <input placeholder="Назва" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Колір" value={color} onChange={(e) => setColor(e.target.value)} />
      <input placeholder="Тип" value={type} onChange={(e) => setType(e.target.value)} />
      <input placeholder="Ціна" value={price} onChange={(e) => setPrice(e.target.value)} />
      <input placeholder="Опис" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input placeholder="URL зображення" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <input placeholder="Назва магазину" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
      <input placeholder="Telegram магазину" value={storeTelegram} onChange={(e) => setStoreTelegram(e.target.value)} />
      <input placeholder="Instagram магазину" value={storeInstagram} onChange={(e) => setStoreInstagram(e.target.value)} />
      <input placeholder="Інформація про доставку" value={storeShipping} onChange={(e) => setStoreShipping(e.target.value)} />
      <button onClick={handleAddItem} style={{ marginTop: 10 }}>Додати предмет</button>
    </div>
  );
};

export default AdminAddItem;
