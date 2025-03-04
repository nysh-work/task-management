"use client"

import { useState, useEffect } from "react"
import { 
  getSavedLocations, 
  type NamedLocation,
  getCurrentPosition,
  type LocationCoordinates
} from "@/lib/location-service"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  MapPin, 
  AlertCircle, 
  Plus,
  Loader2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export interface LocationReminderData {
  locationId: string
  enabled: boolean
  notifyOnArrival: boolean
  notifyOnDeparture: boolean
  message?: string
}

interface LocationReminderFieldsProps {
  value: LocationReminderData | undefined
  onChange: (data: LocationReminderData | undefined) => void
}

// Type for input events
interface InputChangeEvent extends React.ChangeEvent<HTMLInputElement> {}
interface TextareaChangeEvent extends React.ChangeEvent<HTMLTextAreaElement> {}

export function LocationReminderFields({ value, onChange }: LocationReminderFieldsProps) {
  const [savedLocations, setSavedLocations] = useState<NamedLocation[]>([])
  const [isEnabled, setIsEnabled] = useState(value?.enabled || false)
  const [selectedLocationId, setSelectedLocationId] = useState(value?.locationId || "")
  const [notifyOnArrival, setNotifyOnArrival] = useState(value?.notifyOnArrival || true)
  const [notifyOnDeparture, setNotifyOnDeparture] = useState(value?.notifyOnDeparture || false)
  const [reminderMessage, setReminderMessage] = useState(value?.message || "")
  
  // Add location dialog state
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false)
  const [newLocationName, setNewLocationName] = useState("")
  const [newLocationRadius, setNewLocationRadius] = useState(100)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Load saved locations from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    setSavedLocations(getSavedLocations());
  }, [isAddLocationOpen]);

  // Update the parent component when values change
  useEffect(() => {
    if (!isEnabled) {
      onChange(undefined)
      return
    }

    if (!selectedLocationId && savedLocations.length > 0) {
      setSelectedLocationId(savedLocations[0].id)
    }

    onChange({
      locationId: selectedLocationId,
      enabled: isEnabled,
      notifyOnArrival,
      notifyOnDeparture, 
      message: reminderMessage
    })
  }, [isEnabled, selectedLocationId, notifyOnArrival, notifyOnDeparture, reminderMessage, savedLocations, onChange])

  // Get current location for adding a new location
  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true)
    setLocationError(null)
    
    try {
      const position = await getCurrentPosition()
      setCurrentLocation(position)
    } catch (error) {
      setLocationError((error as Error).message || "Could not get your location")
    } finally {
      setIsLoadingLocation(false)
    }
  }

  // Save a new location
  const handleAddLocation = () => {
    if (!newLocationName || !currentLocation) return
    
    const newLocation: NamedLocation = {
      id: Date.now().toString(),
      name: newLocationName,
      coordinates: currentLocation,
      radius: newLocationRadius
    }
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      const locations = getSavedLocations()
      const updatedLocations = [...locations, newLocation]
      localStorage.setItem('savedLocations', JSON.stringify(updatedLocations))
      setSavedLocations(updatedLocations)
      setSelectedLocationId(newLocation.id)
    }
    
    // Close dialog and reset form
    setIsAddLocationOpen(false)
    setNewLocationName("")
    setNewLocationRadius(100)
    setCurrentLocation(null)
  }

  // If no locations are saved, show a message
  if (savedLocations.length === 0 && isEnabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-location-reminder" className="font-medium">
            Location Reminder
          </Label>
          <Switch
            id="enable-location-reminder"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>
        
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/50">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-yellow-800 dark:text-yellow-300">No saved locations. Add a location to enable location-based reminders.</p>
          </div>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddLocationOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Location
            </Button>
          </div>
        </div>

        {/* Add Location Dialog */}
        <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="location-name">Location Name</Label>
                <Input
                  id="location-name"
                  placeholder="Home, Office, Gym, etc."
                  value={newLocationName}
                  onChange={(e: InputChangeEvent) => setNewLocationName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location-radius">Radius (meters)</Label>
                <Input
                  id="location-radius"
                  type="number"
                  min={50}
                  max={1000}
                  value={newLocationRadius}
                  onChange={(e: InputChangeEvent) => setNewLocationRadius(parseInt(e.target.value) || 100)}
                />
                <p className="text-xs text-gray-500">
                  How close you need to be to trigger the reminder
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Current Location</Label>
                {currentLocation ? (
                  <div className="rounded-md bg-gray-100 p-2 text-sm dark:bg-gray-800">
                    <p>Latitude: {currentLocation.latitude.toFixed(6)}</p>
                    <p>Longitude: {currentLocation.longitude.toFixed(6)}</p>
                    {currentLocation.accuracy && (
                      <p>Accuracy: ±{Math.round(currentLocation.accuracy)}m</p>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleGetCurrentLocation}
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Get Current Location
                      </>
                    )}
                  </Button>
                )}
                {locationError && (
                  <p className="text-xs text-red-500">{locationError}</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={handleAddLocation}
                disabled={!newLocationName || !currentLocation}
              >
                Add Location
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="enable-location-reminder" className="font-medium">
          Location Reminder
        </Label>
        <Switch
          id="enable-location-reminder"
          checked={isEnabled}
          onCheckedChange={setIsEnabled}
        />
      </div>

      {isEnabled && (
        <>
          <div className="grid grid-cols-[1fr,auto] gap-2 items-center">
            <div className="space-y-2">
              <Label htmlFor="location-select">Location</Label>
              <Select 
                value={selectedLocationId} 
                onValueChange={setSelectedLocationId}
              >
                <SelectTrigger id="location-select">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {savedLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="mt-6"
              onClick={() => setIsAddLocationOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-message">Reminder Message (Optional)</Label>
            <Input
              id="reminder-message"
              placeholder="Custom reminder message"
              value={reminderMessage}
              onChange={(e: InputChangeEvent) => setReminderMessage(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="font-medium">Notification Settings</Label>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="notify-arrival" 
                checked={notifyOnArrival}
                onCheckedChange={(checked: boolean) => setNotifyOnArrival(checked)}
              />
              <Label htmlFor="notify-arrival" className="font-normal">
                Notify on arrival
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="notify-departure" 
                checked={notifyOnDeparture}
                onCheckedChange={(checked: boolean) => setNotifyOnDeparture(checked)}
              />
              <Label htmlFor="notify-departure" className="font-normal">
                Notify on departure
              </Label>
            </div>
          </div>
        </>
      )}

      {/* Add Location Dialog */}
      <Dialog open={isAddLocationOpen} onOpenChange={setIsAddLocationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="location-name">Location Name</Label>
              <Input
                id="location-name"
                placeholder="Home, Office, Gym, etc."
                value={newLocationName}
                onChange={(e: InputChangeEvent) => setNewLocationName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location-radius">Radius (meters)</Label>
              <Input
                id="location-radius"
                type="number"
                min={50}
                max={1000}
                value={newLocationRadius}
                onChange={(e: InputChangeEvent) => setNewLocationRadius(parseInt(e.target.value) || 100)}
              />
              <p className="text-xs text-gray-500">
                How close you need to be to trigger the reminder
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Current Location</Label>
              {currentLocation ? (
                <div className="rounded-md bg-gray-100 p-2 text-sm dark:bg-gray-800">
                  <p>Latitude: {currentLocation.latitude.toFixed(6)}</p>
                  <p>Longitude: {currentLocation.longitude.toFixed(6)}</p>
                  {currentLocation.accuracy && (
                    <p>Accuracy: ±{Math.round(currentLocation.accuracy)}m</p>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleGetCurrentLocation}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="mr-2 h-4 w-4" />
                      Get Current Location
                    </>
                  )}
                </Button>
              )}
              {locationError && (
                <p className="text-xs text-red-500">{locationError}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={handleAddLocation}
              disabled={!newLocationName || !currentLocation}
            >
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 