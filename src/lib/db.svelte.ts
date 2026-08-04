import { browser } from '$app/environment';

import chocolates from '$lib/assets/imgs/3chocolates.jpg';
import arandanos from '$lib/assets/imgs/arandanos.jpg';
import brownieDeNuez from '$lib/assets/imgs/nuez.jpg';
import empanadaDeQueso from '$lib/assets/imgs/empaqueso.jpg';
import panDeMantequilla from '$lib/assets/imgs/MANTEQUILLA.jpg';
import cafeAmericano from '$lib/assets/imgs/camericano.jpg';
import espresso from '$lib/assets/imgs/expresoita.jpg';
import latte from '$lib/assets/imgs/latte.jpg';
import mochaClasico from '$lib/assets/imgs/mochaclasicv.jpg';
import capuccino from '$lib/assets/imgs/capuccino.jfif';
import coldBrew from '$lib/assets/imgs/coldbrew.jpg';
import limonMenta from '$lib/assets/imgs/limomenta.jpg';
import teDeMelocoton from '$lib/assets/imgs/melocoton.jpg';
import smoothieDeFresa from '$lib/assets/imgs/sfresaplata.jpg';
import frappe from '$lib/assets/imgs/frappe.jfif';

// Interfaz del Producto
export interface Product {
  id: number;
  name: string;
  desc: string;
  price: number;
  originalPrice?: number;
  img: string;
  category: 'cafes' | 'frios' | 'snacks';
  featured?: boolean;
}

// Seed Data
const initialProducts: Product[] = [
  // cafes
  { id: 1, name: 'Café Americano', desc: 'Granos selectos de altura, tostado medio con notas maderosas.', price: 35.00, img: cafeAmericano, category: 'cafes' },
  { id: 2, name: 'Capuccino Imperial', desc: 'Espresso perfecto con una capa densa y cremosa de leche evaporada.', price: 48.00, img: capuccino, category: 'cafes', featured: true },
  { id: 3, name: 'Café Latte', desc: 'Suave combinación balanceada de café espresso y leche caliente.', price: 45.00, img: latte, category: 'cafes' },
  { id: 6, name: 'Espresso Italiano', desc: 'Intenso y concentrado, con crema aterciopelada y aroma profundo.', price: 38.00, img: espresso, category: 'cafes' },
  { id: 7, name: 'Mocha Clásico', desc: 'Café espresso con chocolate belga y leche vaporizada, coronado con crema.', price: 52.00, originalPrice: 58.00, img: mochaClasico, category: 'cafes', featured: true },
  // frios
  { id: 4, name: 'Frappé Lirios Caramel', desc: 'Café licuado con hielo, jarabe de caramelo premium y crema batida.', price: 55.00, img: frappe, category: 'frios', featured: true },
  { id: 8, name: 'Cold Brew Nitro', desc: 'Café de fermentación en frío por 24h, infusionado con nitrógeno para textura cremosa.', price: 58.00, img: coldBrew, category: 'frios' },
  { id: 9, name: 'Limonada de Menta', desc: 'Refrescante limonada natural con hojas de menta fresca y hielo picado.', price: 42.00, img: limonMenta, category: 'frios' },
  { id: 10, name: 'Smoothie Fresa-Platano', desc: 'Batido cremoso de fresa y banano con yogurt natural y miel de abeja.', price: 50.00, img: smoothieDeFresa, category: 'frios' },
  { id: 11, name: 'Té Helado de Melocotón', desc: 'Infusión de té negro con jugo de melocotón, servido con hielo y rodaja cítrica.', price: 40.00, img: teDeMelocoton, category: 'frios' },
  // snacks
  { id: 5, name: 'Muffin de Arándanos', desc: 'Panecillo horneado crujiente por fuera y esponjoso por dentro.', price: 28.00, img: arandanos, category: 'snacks' },
  { id: 12, name: 'Croissant de Mantequilla', desc: 'Hojaldre francés con capas crujientes y centro suave y mantecoso.', price: 32.00, img: panDeMantequilla, category: 'snacks', featured: true },
  { id: 13, name: 'Galleta Triple Chocolate', desc: 'Galleta crujiente con chispas de chocolate blanco, negro y leche.', price: 22.00, img: chocolates, category: 'snacks' },
  { id: 14, name: 'Empanada de Queso', desc: 'Masa dorada y crujiente rellena de queso fundido y toques de orégano.', price: 26.00, originalPrice: 32.00, img: empanadaDeQueso, category: 'snacks', featured: true },
  { id: 15, name: 'Brownie con Nueces', desc: 'Bizcocho de chocolate intenso con trozos de nuez y textura húmeda.', price: 30.00, img: brownieDeNuez, category: 'snacks' }
];

/**
 * Clase que asemeja el uso de una DB de forma local.
 * No hay necesidad para el MVP de implementar api calls para una db remota.
 */
class LocalDbStore {
  products = $state<Product[]>([]);

  constructor() {
    if (!browser) return;

    // Cargar desde localStorage o inicializar con los datos por defecto
    const saved = localStorage.getItem('local_db_products');
    if (saved) {
      try {
        this.products = JSON.parse(saved);
        
      } catch {
        this.products = initialProducts;
        this.save();
      }
      
    } else {
      this.products = initialProducts;
      this.save();
      
    }
  }


  private save() {
    if (!browser) { return }
    localStorage.setItem('local_db_products', JSON.stringify(this.products));
  }

  /** 
   * Obtiene un producto por su ID 
  */
  getById(id: number): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  /** 
   * Obtiene productos filtrados por categoría 
  */
  getByCategory(category: Product['category']): Product[] {
    return this.products.filter((p) => p.category === category);
  }

  /** 
   * Agrega un nuevo producto
  */
  add(product: Omit<Product, 'id'>) {
    const newId = this.products.length > 0 ? Math.max(...this.products.map((p) => p.id)) + 1 : 1;
    const newProduct: Product = { ...product, id: newId };

    this.products.push(newProduct);
    this.save();
    return newProduct;
  }

  /** 
   * Actualiza un producto existente por su ID 
  */
  update(id: number, updatedFields: Partial<Omit<Product, 'id'>>) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updatedFields };
      this.save();
    }
  }

  /** 
   * Elimina un producto por su ID 
  */
  delete(id: number) {
    this.products = this.products.filter((p) => p.id !== id);
    this.save();
  }

  /** 
   * Restablece la base de datos local a los productos por defecto 
  */
  reset() {
    this.products = initialProducts;
    this.save();
  }
}

// Exportar singleton
export const db = new LocalDbStore();