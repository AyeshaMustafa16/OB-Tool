"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  AlertCircle,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Code,
} from "lucide-react"

interface RichTextEditorProps {
  initialValue?: string
  onSave: (content: string) => Promise<void>
  height?: number
  editorType?: "html" | "css"
  title?: string
  placeholders?: Array<{ name: string; description: string }>
}

export function RichTextEditor({
  initialValue = "",
  onSave,
  height = 500,
  editorType = "html",
  title = "Editor",
  placeholders = [],
}: RichTextEditorProps) {
  // Always default to code view for PHP content
  const [activeTab, setActiveTab] = useState<"visual" | "code">(
    editorType === "css" || (initialValue && initialValue.includes("<?")) ? "code" : "visual",
  )
  const [content, setContent] = useState(initialValue)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const editorRef = useRef<HTMLDivElement>(null)
  const [hasPhpCode, setHasPhpCode] = useState(initialValue && initialValue.includes("<?"))

  // Function to detect PHP code
  const detectPhpCode = (text: string): boolean => {
    return text.includes("<?php") || text.includes("<?=") || text.includes("<?")
  }

  useEffect(() => {
    setContent(initialValue)
    setHasPhpCode(detectPhpCode(initialValue))

    if (editorRef.current && activeTab === "visual" && !detectPhpCode(initialValue)) {
      editorRef.current.innerHTML = initialValue
    }
  }, [initialValue])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveStatus("idle")
      setErrorMessage("")

      // Always use the content from the textarea when in code view or when PHP code is detected
      const contentToSave =
        activeTab === "code" || hasPhpCode ? content : editorRef.current ? editorRef.current.innerHTML : content

      await onSave(contentToSave)
      setSaveStatus("success")

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Error saving content:", error)
      setSaveStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  const execCommand = (command: string, value: string | null = null) => {
    if (activeTab === "visual" && editorRef.current) {
      document.execCommand(command, false, value)
      setContent(editorRef.current.innerHTML)
      editorRef.current.focus()
    }
  }

  const insertPlaceholder = (placeholder: string) => {
    if (activeTab === "visual" && editorRef.current) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const placeholderNode = document.createTextNode(placeholder)
        range.insertNode(placeholderNode)
        range.setStartAfter(placeholderNode)
        range.setEndAfter(placeholderNode)
        selection.removeAllRanges()
        selection.addRange(range)
        setContent(editorRef.current.innerHTML)
      } else {
        editorRef.current.innerHTML += placeholder
        setContent(editorRef.current.innerHTML)
      }
    } else {
      // For code view, insert at cursor position or append to end
      const textarea = document.querySelector("textarea") as HTMLTextAreaElement
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newContent = content.substring(0, start) + placeholder + content.substring(end)
        setContent(newContent)
        // Set cursor position after the inserted placeholder
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + placeholder.length
          textarea.focus()
        }, 0)
      }
    }
  }

  // Handle tab change with PHP detection
  const handleTabChange = (value: string) => {
    if (value === "visual" && hasPhpCode) {
      if (confirm("Your content contains PHP code which may break in visual mode. Continue anyway?")) {
        setActiveTab(value as "visual" | "code")
        if (editorRef.current) {
          editorRef.current.innerHTML = content
        }
      }
    } else {
      setActiveTab(value as "visual" | "code")
      if (value === "visual" && editorRef.current) {
        editorRef.current.innerHTML = content
      }
    }
  }

  // Handle visual editor input with PHP detection
  const handleVisualEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = (e.target as HTMLDivElement).innerHTML
    setContent(newContent)

    // Check if PHP code was added
    if (detectPhpCode(newContent) && !hasPhpCode) {
      setHasPhpCode(true)
      alert("PHP code detected. Consider switching to code view for better editing.")
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <Card className="w-full lg:w-8/12">
        <CardHeader className="pb-3">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              {editorType === "html" && (
                <TabsTrigger value="visual" disabled={editorType === "css"}>
                  Visual Editor
                </TabsTrigger>
              )}
              <TabsTrigger value="code">{editorType === "css" ? "CSS Editor" : "HTML/PHP Editor"}</TabsTrigger>
            </TabsList>

            {editorType === "html" && (
              <TabsContent value="visual" className="mt-0">
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-100 p-2 border-b flex flex-wrap gap-2">
                    <Button variant="ghost" size="icon" onClick={() => execCommand("bold")} className="h-8 w-8">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => execCommand("italic")} className="h-8 w-8">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => execCommand("justifyLeft")} className="h-8 w-8">
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => execCommand("justifyCenter")}
                      className="h-8 w-8"
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => execCommand("justifyRight")} className="h-8 w-8">
                      <AlignRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => execCommand("insertUnorderedList")}
                      className="h-8 w-8"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => execCommand("insertOrderedList")}
                      className="h-8 w-8"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const url = prompt("Enter link URL:")
                        if (url) execCommand("createLink", url)
                      }}
                      className="h-8 w-8"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const url = prompt("Enter image URL:")
                        if (url) execCommand("insertImage", url)
                      }}
                      className="h-8 w-8"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveTab("code")}
                      className="h-8 w-8"
                      title="Switch to code view for PHP editing"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <select
                      className="h-8 px-2 rounded border text-sm"
                      onChange={(e) => execCommand("formatBlock", e.target.value)}
                    >
                      <option value="">Format</option>
                      <option value="h1">Heading 1</option>
                      <option value="h2">Heading 2</option>
                      <option value="h3">Heading 3</option>
                      <option value="p">Paragraph</option>
                    </select>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    className="p-4 min-h-[300px]"
                    style={{ height: `${height - 50}px`, overflow: "auto" }}
                    dangerouslySetInnerHTML={{ __html: content }}
                    onInput={handleVisualEditorInput}
                  />
                </div>
                {hasPhpCode && (
                  <Alert className="mt-2 bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-700">
                      PHP code detected. Consider using the code editor for better PHP editing.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            )}

            <TabsContent value="code" className="mt-0">
              <div className="relative">
                <textarea
                  className="w-full p-4 font-mono text-sm bg-gray-50 border rounded-md"
                  style={{ height: `${height}px`, resize: "vertical" }}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value)
                    setHasPhpCode(detectPhpCode(e.target.value))
                  }}
                  spellCheck="false"
                />
              </div>
            </TabsContent>
          </Tabs>

          {saveStatus === "success" && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">Content saved successfully!</AlertDescription>
            </Alert>
          )}

          {saveStatus === "error" && (
            <Alert className="mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{errorMessage || "Failed to save content"}</AlertDescription>
            </Alert>
          )}

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="bg-[#d9365e] hover:bg-[#c02e53]">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {placeholders.length > 0 && (
        <Card className="w-full lg:w-4/12">
          <CardHeader className="pb-3">
            <CardTitle>Available Placeholders</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="max-h-[500px] overflow-y-auto pr-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#555 #F5F5F5",
              }}
            >
              {placeholders.map((placeholder, index) => (
                <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                  <div className="text-sm text-gray-500 mb-1">{placeholder.description}</div>
                  <div className="flex items-center">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">{placeholder.name}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertPlaceholder(placeholder.name)}
                      className="ml-2 text-xs"
                    >
                      Insert
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
