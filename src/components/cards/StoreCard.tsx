import React from 'react';

export const StoreCard = ({ store }: { store: any }) => {
  return (
    <div className="p-4 bg-card rounded-xl shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-muted rounded-full" />
        <div>
          <div className="font-medium">{store.name}</div>
          <div className="text-sm text-muted-foreground">{store.location || store.region}</div>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
