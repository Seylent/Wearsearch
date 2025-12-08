import React from 'react';

export const CategoryCard = ({ name, image }: { name: string; image?: string }) => {
  return (
    <div className="p-4 bg-card rounded-lg text-center">
      {image ? <img src={image} alt={name} className="w-full h-28 object-cover rounded-md mb-3" /> : <div className="h-28 bg-muted rounded-md mb-3" />}
      <div className="font-medium">{name}</div>
    </div>
  );
};

export default CategoryCard;
