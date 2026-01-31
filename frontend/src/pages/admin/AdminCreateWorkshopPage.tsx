import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Upload, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { workshopApi } from '../../services/api/workshopApi'

const workshopSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    categoryId: z.coerce.number().min(1, 'Category is required'),
    speakerId: z.coerce.number().min(1, 'Speaker is required'),
    price: z.coerce.number().min(0, 'Price must be 0 or greater'),
    maxSeats: z.coerce.number().optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    learningOutcomes: z.string().optional(),
    requirements: z.string().optional(),
})

type WorkshopFormData = z.infer<typeof workshopSchema>

const AdminCreateWorkshopPage = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [bannerImage, setBannerImage] = useState<File | null>(null)

    // Mock data for categories and speakers (replace with API calls later)
    const categories = [
        { id: 1, name: 'Technology' },
        { id: 2, name: 'Design' },
        { id: 3, name: 'Business' },
    ]

    const speakers = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
    ]

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<WorkshopFormData>({
        resolver: zodResolver(workshopSchema),
        defaultValues: {
            price: 0,
        },
    })

    const onSubmit = async (data: WorkshopFormData) => {
        try {
            setIsLoading(true)

            // Format data for API
            // Note: In a real app we'd handle file upload here too
            const workshopData = {
                ...data,
                status: 'PUBLISHED', // Default to published for now, or add a field
                // Add any other required fields or transformations
            }

            console.log('Creating workshop:', workshopData)
            await workshopApi.create(workshopData)

            toast.success('Workshop created successfully')
            navigate('/admin/workshops')
        } catch (error) {
            toast.error('Failed to create workshop')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/workshops')}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Workshops
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Workshop</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Workshop Title
                            </label>
                            <input
                                type="text"
                                {...register('title')}
                                className="input input-primary w-full"
                                placeholder="e.g., Advanced React Patterns"
                            />
                            {errors.title && (
                                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                className="input input-primary w-full py-2"
                                placeholder="Detailed description of the workshop..."
                            />
                            {errors.description && (
                                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select {...register('categoryId')} className="input input-primary w-full">
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Speaker
                            </label>
                            <select {...register('speakerId')} className="input input-primary w-full">
                                <option value="">Select Speaker</option>
                                {speakers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            {errors.speakerId && (
                                <p className="text-red-500 text-xs mt-1">{errors.speakerId.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date & Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                {...register('startDate')}
                                className="input input-primary w-full"
                            />
                            {errors.startDate && (
                                <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                {...register('endDate')}
                                className="input input-primary w-full"
                            />
                            {errors.endDate && (
                                <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                            </label>
                            <input
                                type="time"
                                {...register('startTime')}
                                className="input input-primary w-full"
                            />
                            {errors.startTime && (
                                <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                            </label>
                            <input
                                type="time"
                                {...register('endTime')}
                                className="input input-primary w-full"
                            />
                            {errors.endTime && (
                                <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pricing & Seats */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                {...register('price')}
                                className="input input-primary w-full"
                            />
                            {errors.price && (
                                <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Seats (Optional)
                            </label>
                            <input
                                type="number"
                                min="1"
                                {...register('maxSeats')}
                                className="input input-primary w-full"
                                placeholder="Unlimited"
                            />
                            {errors.maxSeats && (
                                <p className="text-red-500 text-xs mt-1">{errors.maxSeats.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Banner Image
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                                    >
                                        <span>Upload a file</span>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            onChange={(e) => setBannerImage(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                {bannerImage && (
                                    <p className="text-sm text-green-600 font-medium">{bannerImage.name}</p>
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="border-t pt-6 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/workshops')}
                            className="btn btn-outline"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary min-w-[120px]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                'Create Workshop'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AdminCreateWorkshopPage
