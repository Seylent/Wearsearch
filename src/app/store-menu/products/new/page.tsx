/**
 * Add Product Page
 * Multi-step form for adding new or existing products
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStoreContext } from '@/features/store-menu/context/StoreContext';
import { Package, PlusCircle, Search, ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react';
import { StoreMenuLayout } from '@/features/store-menu/components/StoreMenuLayout';
import {
  useCreateProduct,
  useSiteProducts,
  useAddExistingProduct,
} from '@/features/store-menu/hooks/useStoreMenu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { OptimizedImage } from '@/components/OptimizedImage';
import { toast } from 'sonner';

type ProductSource = 'new' | 'existing';
type Step = 1 | 2 | 3 | 4 | 5;

const SIZES = [
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
];

function SourceSelection({ onSelect }: { onSelect: (source: ProductSource) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card
        className="cursor-pointer transition-colors hover:border-primary"
        onClick={() => onSelect('new')}
      >
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <PlusCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mb-2">Створити новий товар</CardTitle>
          <CardDescription>Заповніть всі дані для створення нового товару</CardDescription>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer transition-colors hover:border-primary"
        onClick={() => onSelect('existing')}
      >
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mb-2">Додати існуючий товар</CardTitle>
          <CardDescription>Виберіть товар з каталогу сайту</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}

function NewProductForm({ storeId }: { storeId: string }) {
  const router = useRouter();
  const createMutation = useCreateProduct();
  const [step, setStep] = useState<Step>(2);
  const [formData, setFormData] = useState({
    name: '',
    color: '',
    category_id: '',
    gender: 'unisex' as 'male' | 'female' | 'unisex',
    brand_id: '',
    store_price: '',
    sizes: [] as string[],
    images: [] as string[],
    description: '',
    materials: [] as string[],
    technologies: [] as string[],
  });

  const handleNext = () => {
    if (step < 5) setStep(s => (s + 1) as Step);
  };

  const handleBack = () => {
    if (step > 2) setStep(s => (s - 1) as Step);
  };

  const handleSubmit = async () => {
    try {
      await createMutation.mutateAsync({
        storeId,
        data: {
          ...formData,
          store_price: Number(formData.store_price),
        },
      });
      toast.success('Товар успішно створено та додано до магазину');
      router.push(`/store-menu/products/my?store_id=${storeId}`);
    } catch {
      toast.error('Помилка при створенні товару');
    }
  };

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
    }));
  };

  const isStepValid = () => {
    switch (step) {
      case 2:
        return formData.name && formData.color && formData.category_id;
      case 3:
        return formData.store_price && formData.sizes.length > 0;
      case 4:
        return formData.images.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {[2, 3, 4, 5].map(s => (
          <React.Fragment key={s}>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s < step ? <Check className="h-4 w-4" /> : s - 1}
            </div>
            {s < 5 && <div className={`h-1 flex-1 ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
          </React.Fragment>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 2 && 'Основні дані'}
            {step === 3 && 'Ціна та наявність'}
            {step === 4 && 'Медіа та опис'}
            {step === 5 && 'Перевірка та публікація'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Назва товару *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Наприклад: Nike Air Max"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Колір *</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={e => updateField('color', e.target.value)}
                  placeholder="Наприклад: Чорний"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Категорія *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={v => updateField('category_id', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть категорію" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shoes">Взуття</SelectItem>
                    <SelectItem value="clothing">Одяг</SelectItem>
                    <SelectItem value="accessories">Аксесуари</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Стать</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={v => updateField('gender', v)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Чоловіча</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Жіноча</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unisex" id="unisex" />
                    <Label htmlFor="unisex">Унісекс</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Бренд</Label>
                <Select value={formData.brand_id} onValueChange={v => updateField('brand_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть бренд" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nike">Nike</SelectItem>
                    <SelectItem value="adidas">Adidas</SelectItem>
                    <SelectItem value="puma">Puma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="price">Моя ціна *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.store_price}
                  onChange={e => updateField('store_price', e.target.value)}
                  placeholder="Введіть ціну в грн"
                />
              </div>

              <div className="space-y-2">
                <Label>Розміри *</Label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <Badge
                      key={size}
                      variant={formData.sizes.includes(size) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="space-y-2">
                <Label>Фото товару *</Label>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-24 w-24 flex-col gap-1">
                    <Upload className="h-6 w-6" />
                    <span className="text-xs">Завантажити</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Підтримуються формати: JPG, PNG, WebP
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => updateField('description', e.target.value)}
                  placeholder="Опишіть товар..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Матеріали</Label>
                <div className="flex flex-wrap gap-2">
                  {['Шкіра', 'Текстиль', 'Синтетика', 'Гума'].map(material => (
                    <div key={material} className="flex items-center space-x-2">
                      <Checkbox
                        id={material}
                        checked={formData.materials.includes(material)}
                        onCheckedChange={checked => {
                          setFormData(prev => ({
                            ...prev,
                            materials: checked
                              ? [...prev.materials, material]
                              : prev.materials.filter(m => m !== material),
                          }));
                        }}
                      />
                      <Label htmlFor={material} className="text-sm">
                        {material}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">Перевірте дані:</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Назва:</dt>
                    <dd className="font-medium">{formData.name || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Колір:</dt>
                    <dd className="font-medium">{formData.color || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Категорія:</dt>
                    <dd className="font-medium">{formData.category_id || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Ціна:</dt>
                    <dd className="font-medium">
                      {formData.store_price ? `${formData.store_price} грн` : '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Розміри:</dt>
                    <dd className="font-medium">
                      {formData.sizes.length > 0 ? formData.sizes.join(', ') : '—'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Після публікації товар з&apos;явиться у вашому магазині та буде доступний для
                  покупців.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleBack} disabled={step === 2}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            {step < 5 ? (
              <Button onClick={handleNext} disabled={!isStepValid()}>
                Далі
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Публікація...' : 'Опублікувати'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExistingProductSelector({ storeId }: { storeId: string }) {
  const router = useRouter();
  const addMutation = useAddExistingProduct();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [storePrice, setStorePrice] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const { data, isLoading } = useSiteProducts(storeId, 1, search);
  const products = data?.items || [];

  const handleAdd = async () => {
    if (!selectedProduct || !storePrice || selectedSizes.length === 0) return;

    try {
      await addMutation.mutateAsync({
        storeId,
        data: {
          product_id: selectedProduct,
          store_price: Number(storePrice),
          sizes: selectedSizes,
        },
      });
      toast.success('Товар додано до вашого магазину');
      router.push('/store-menu/products/my');
    } catch {
      toast.error('Помилка при додаванні товару');
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Пошук товарів..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="mb-4 h-40" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : products.length > 0 ? (
          products.map(product => (
            <Card
              key={product.id}
              className={`cursor-pointer transition-colors ${
                selectedProduct === product.id ? 'border-primary ring-1 ring-primary' : ''
              }`}
              onClick={() => setSelectedProduct(product.id)}
            >
              <CardContent className="p-4">
                <div className="mb-4 aspect-square overflow-hidden rounded-md">
                  <OptimizedImage
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="font-medium line-clamp-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.brand}</p>
                <p className="mt-2 font-semibold">
                  {Number.isFinite(Number(product.base_price))
                    ? Number(product.base_price).toLocaleString('uk-UA')
                    : '—'}{' '}
                  грн
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4">Товарів не знайдено</p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Додати вибраний товар</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-price">Моя ціна *</Label>
              <Input
                id="store-price"
                type="number"
                value={storePrice}
                onChange={e => setStorePrice(e.target.value)}
                placeholder="Введіть ціну в грн"
              />
            </div>

            <div className="space-y-2">
              <Label>Розміри в наявності *</Label>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => (
                  <Badge
                    key={size}
                    variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleAdd}
              disabled={!storePrice || selectedSizes.length === 0 || addMutation.isPending}
            >
              {addMutation.isPending ? 'Додавання...' : 'Додати до мого магазину'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AddProductContent({ storeId }: { storeId: string }) {
  const [source, setSource] = useState<ProductSource | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/store-menu/products/my">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Додати товар</h1>
          <p className="text-muted-foreground">Виберіть спосіб додавання товару</p>
        </div>
      </div>

      {!source ? (
        <SourceSelection onSelect={setSource} />
      ) : source === 'new' ? (
        <NewProductForm storeId={storeId} />
      ) : (
        <ExistingProductSelector storeId={storeId} />
      )}
    </div>
  );
}

export default function AddProductPage() {
  const { selectedStoreId, isLoading } = useStoreContext();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Skeleton className="h-20" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedStoreId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              ID магазину не вказано. Перейдіть зі списку ваших магазинів.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <StoreMenuLayout>
      <AddProductContent storeId={selectedStoreId} />
    </StoreMenuLayout>
  );
}
