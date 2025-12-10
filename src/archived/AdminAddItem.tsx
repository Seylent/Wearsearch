// AdminAddItem.tsx
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Спочатку залогіньтесь!");
      return;
    }

    try {
      // First, check if store exists or create it
      let storeId: string;
      
      const { data: existingStore } = await supabase
        .from("stores")
        .select("id")
        .eq("name", storeName)
        .maybeSingle();

      if (existingStore) {
        storeId = existingStore.id;
      } else {
        // Create new store
        const { data: newStore, error: storeError } = await supabase
          .from("stores")
          .insert({
            name: storeName,
            telegram_url: storeTelegram || null,
            instagram_url: storeInstagram || null,
            shipping_info: storeShipping || null,
          })
          .select()
          .single();

        if (storeError) throw storeError;
        storeId = newStore.id;
      }

      // Create product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name,
          color,
          type,
          price: parseFloat(price),
          description: description || null,
          image_url: imageUrl || null,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Link product to store
      const { error: linkError } = await supabase
        .from("product_stores")
        .insert({
          product_id: product.id,
          store_id: storeId,
        });

      if (linkError) throw linkError;

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
