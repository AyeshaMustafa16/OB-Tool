export interface HeaderConfig {
  ticker: TickerConfig
  nav: BarConfig[]
}

export interface TickerConfig {
  header_ticker_on_off: boolean
  sticky_ticker: boolean
  ticker_bg_color: string
  ticker_font_color: string
  header_ticker_text: string
}

export interface BarConfig {
  id: string
  show_bar: boolean
  sticky_header: boolean
  transparent_header: boolean
  container: boolean
  active_link: boolean
  height: string
  border_top: string
  border_bottom: string
  margin: string
  padding: string
  bar_background_color: string
  list: ListConfig[]
}

export interface ListConfig {
  id: string
  position: "left" | "center" | "right"
  items: ItemConfig[]
}

// Update the ItemConfig interface to include setting property
export interface ItemConfig {
  id: string
  type:
    | "link"
    | "logo"
    | "search"
    | "cart"
    | "facebook"
    | "instagram"
    | "twitter"
    | "email"
    | "number"
    | "login_signup"
    | "location"
  icon: string
  name: string
  color: string
  route: string
  background_color: string
  border_radius: string
  margin: string
  padding: string
  font_size: string
  border: string
  border_left: string
  extra_class: string
  extra_attribute: string
  font_weight: string
  target_blank: boolean
  sub_link: boolean
  sub_settings?: Record<string, any>
  custom_sub_link?: boolean
  sl_custom_html?: string
  search_border_bottom?: boolean
  search_placeholder?: string
  search_width?: string
  show_price?: boolean
  cart_price_label_color?: string
  cart_count_bg_color?: string
  cart_count_top?: string
  cart_count_right?: string
  current_location?: boolean
  setting?: {
    item_label?: string
    item_label_color?: string
    item_route?: string
    [key: string]: any
  }
}

export interface SubLinkConfig {
  id: string
  sub_link_label: string
  sub_link_route: string
  sub_link_icon: string
  inner_sub_link_on_off: boolean
  inner_sub_settings?: InnerSubLinkConfig[]
}

export interface InnerSubLinkConfig {
  id: string
  inner_sub_link_label: string
  inner_sub_link_route: string
}
