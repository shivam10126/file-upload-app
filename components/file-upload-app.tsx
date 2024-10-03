'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileType, Image as ImageIcon, Film, FileAudio, FileText, LogOut } from 'lucide-react'

// Cloudinary configuration
const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset'
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name'

export default function FileUploadApp() {
  const [file, setFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<string>('')
  const [preview, setPreview] = useState<string>('')
  const [manipulatedImage, setManipulatedImage] = useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<string>('upload')

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn')
    if (loggedIn === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setFileType(selectedFile.type)

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)

      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
          setActiveTab('preview')
        }
      }, 200)
    }
  }

  const renderContent = () => {
    if (!file) return null

    switch (fileType) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return <img src={preview} alt="Uploaded file" className="max-w-full h-auto rounded-lg shadow-lg" />
      case 'audio/mpeg':
      case 'audio/wav':
        return <audio controls src={preview} className="w-full" />
      case 'video/mp4':
        return <video controls src={preview} className="max-w-full h-auto rounded-lg shadow-lg" />
      case 'application/pdf':
        return <embed src={preview} type="application/pdf" width="100%" height="600px" className="rounded-lg shadow-lg" />
      default:
        return <p>Unsupported file type</p>
    }
  }

  const getFileTypeIcon = () => {
    switch (fileType.split('/')[0]) {
      case 'image':
        return <ImageIcon className="w-6 h-6" />
      case 'video':
        return <Film className="w-6 h-6" />
      case 'audio':
        return <FileAudio className="w-6 h-6" />
      case 'application':
        return <FileText className="w-6 h-6" />
      default:
        return <FileType className="w-6 h-6" />
    }
  }

  const manipulateImage = async () => {
    if (!file || !fileType.startsWith('image/')) {
      alert('Please upload an image first')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      const manipulatedUrl = data.secure_url.replace('/upload/', '/upload/e_sepia/')
      setManipulatedImage(manipulatedUrl)
      setActiveTab('manipulated')
    } catch (error) {
      console.error('Error manipulating image:', error)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would validate credentials against a backend
    if (username === 'demo' && password === 'password') {
      setIsLoggedIn(true)
      localStorage.setItem('isLoggedIn', 'true')
    } else {
      alert('Invalid credentials')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('isLoggedIn')
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" onClick={handleLogin} className="w-full">Login</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">File Upload and Manipulation App</h1>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="manipulated">Manipulated</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div className="flex items-center justify-center w-full">
                <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                  <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*,audio/*,video/*,application/pdf" />
                </Label>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </TabsContent>
            <TabsContent value="preview">
              {preview && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {getFileTypeIcon()}
                    <span className="font-medium">{file?.name}</span>
                  </div>
                  {renderContent()}
                  {fileType.startsWith('image/') && (
                    <Button onClick={manipulateImage} className="mt-4">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Apply Sepia Effect
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="manipulated">
              {manipulatedImage && (
                <div className="space-y-4">
                  <Alert>
                    <ImageIcon className="h-4 w-4" />
                    <AlertTitle>Image Manipulated</AlertTitle>
                    <AlertDescription>
                      Your image has been successfully manipulated with a sepia effect.
                    </AlertDescription>
                  </Alert>
                  <img src={manipulatedImage} alt="Manipulated image" className="max-w-full h-auto rounded-lg shadow-lg" />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}