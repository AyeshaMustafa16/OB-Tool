export interface CardConfig {
  cards_to_show: string
  card_background_color: string
  card_border: string
  card_shadow: string
  camera_icon: boolean
  zoom_image: boolean
  eye_popup: boolean
  detail_page: boolean
  option_sets: boolean
  category_style: string
  product_code: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
  }
  image: {
    show: boolean
    height: string
    border_radius: string
  }
  product_name: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
  }
  description: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
    max_lines: number
  }
  price: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
  }
  discounted_price: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
    text_decoration: string
  }
  discounted_percentage: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
    background_color: string
    border_radius: string
    padding: string
  }
  category: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
  }
  brand: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
  }
  quantity: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
  }
  weight: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
  }
  sku: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
  }
  note: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
  }
  not_available: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
    text: string
  }
  counter: {
    show: boolean
    button_color: string
    button_text_color: string
    count_color: string
  }
  add_to_cart: {
    show: boolean
    button_text: string
    button_color: string
    button_text_color: string
    border_radius: string
    font_size: string
    font_weight: string
  }
  wishlist: {
    show: boolean
    icon_color: string
  }
  attributes: {
    show: boolean
    font_size: string
    font_weight: string
    color: string
  }
  [key: string]: any
}
