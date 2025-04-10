export function displayInput(id: string, checked: boolean): void {
  const element = document.getElementById(id)
  if (element) {
    element.style.display = checked ? "block" : "none"
  }
}

export function displayMenu(id: string, checked: boolean): void {
  const element = document.getElementById(id)
  if (element) {
    element.style.display = checked ? "block" : "none"
  }
}

export function displayGroupItemBox(id: string, checked: boolean): void {
  const element = document.getElementById(id)
  if (element) {
    element.style.display = checked ? "block" : "none"
  }
}
