'use client'

import { useState } from 'react'
import { Camera, CheckCircle, XCircle, AlertCircle, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GradingResult {
  grade: 'A' | 'B' | 'C' | 'D'
  decision: 'sell' | 'repair' | 'discard'
  estimatedValue: number
  repairCost?: number
  issues: string[]
}

export default function GradingPage() {
  const [itemName, setItemName] = useState('')
  const [condition, setCondition] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null)
  const [isGrading, setIsGrading] = useState(false)

  async function handleGrade() {
    setIsGrading(true)

    // Simulate API call for demonstration
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock result
    setGradingResult({
      grade: 'B',
      decision: 'repair',
      estimatedValue: 450,
      repairCost: 75,
      issues: ['Minor leaf damage', 'Needs pruning', 'Some discoloration']
    })

    setIsGrading(false)
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files))
    }
  }

  function getGradeColor(grade: string) {
    switch (grade) {
      case 'A': return 'text-green-600'
      case 'B': return 'text-blue-600'
      case 'C': return 'text-amber-600'
      case 'D': return 'text-red-600'
      default: return 'text-muted-foreground'
    }
  }

  function getDecisionIcon(decision: string) {
    switch (decision) {
      case 'sell': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'repair': return <AlertCircle className="h-5 w-5 text-amber-600" />
      case 'discard': return <XCircle className="h-5 w-5 text-red-600" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grading Tool</h1>
        <p className="text-muted-foreground">
          Assess plant quality and determine repair vs replace decisions
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+12 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grade A Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">23</div>
            <p className="text-xs text-muted-foreground">49% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repair Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">15</div>
            <p className="text-xs text-muted-foreground">32% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">Estimated sellable</p>
          </CardContent>
        </Card>
      </div>

      {/* Grading Form */}
      <Card>
        <CardHeader>
          <CardTitle>Grade New Item</CardTitle>
          <CardDescription>
            Enter item details and upload photos for quality assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Name/ID</label>
              <Input
                placeholder="e.g., Boxwood #45"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Condition Notes</label>
              <Input
                placeholder="Overall condition, visible issues..."
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Photos (Optional)</label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload photos or drag and drop
                </p>
                {photos.length > 0 && (
                  <p className="text-sm text-primary mt-2">
                    {photos.length} photo(s) selected
                  </p>
                )}
              </label>
            </div>
          </div>

          <Button
            onClick={handleGrade}
            disabled={isGrading || !itemName}
            className="w-full md:w-auto"
          >
            {isGrading ? 'Analyzing...' : 'Grade Item'}
          </Button>
        </CardContent>
      </Card>

      {/* Grading Result */}
      {gradingResult && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Grading Result</span>
              <span className={`text-4xl font-bold ${getGradeColor(gradingResult.grade)}`}>
                Grade {gradingResult.grade}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getDecisionIcon(gradingResult.decision)}
                  <span className="font-medium">Decision</span>
                </div>
                <p className="text-2xl font-bold capitalize">{gradingResult.decision}</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground mb-2">Estimated Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${gradingResult.estimatedValue}
                </p>
              </div>

              {gradingResult.repairCost && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Repair Cost</p>
                  <p className="text-2xl font-bold text-amber-600">
                    ${gradingResult.repairCost}
                  </p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-3">Identified Issues</h4>
              <div className="space-y-2">
                {gradingResult.issues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">Save Report</Button>
              <Button variant="outline">Print Label</Button>
              <Button>Add to Inventory</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Gradings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Gradings</CardTitle>
          <CardDescription>
            Latest quality assessments and decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { item: 'Boxwood #42', grade: 'A', decision: 'sell', value: 550, time: '5 min ago' },
              { item: 'Arborvitae #18', grade: 'B', decision: 'repair', value: 420, time: '12 min ago' },
              { item: 'Holly #33', grade: 'C', decision: 'repair', value: 280, time: '18 min ago' },
              { item: 'Juniper #7', grade: 'D', decision: 'discard', value: 0, time: '25 min ago' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${getGradeColor(item.grade)}`}>
                    {item.grade}
                  </div>
                  <div>
                    <p className="font-medium">{item.item}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {item.decision} • {item.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {item.value > 0 ? `$${item.value}` : 'N/A'}
                  </p>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
