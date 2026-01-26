import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DynIcon } from '~/components/dyn-icon'
import { CreateCategoryDialog } from '~/components/categories/create-dialog'
import { authMiddleware } from '~/middleware/auth'
import { getAllCategoriesWithSubcategories } from '~/server/functions/categories'

export const Route = createFileRoute('/categories')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  const categoriesQuery = useQuery({
    queryKey: ['categories', 'withSubcategories'],
    queryFn: () => getAllCategoriesWithSubcategories(),
  })

  return (
    <div className="p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Categories</h2>
        <CreateCategoryDialog />
      </header>
      <div className="mt-4">
        {categoriesQuery.isLoading && <p>Loading categories...</p>}
        {categoriesQuery.error && (
          <p className="text-red-500">Error loading categories.</p>
        )}
        {categoriesQuery.data && (
          <ul className="mt-2">
            {categoriesQuery.data.map((category) => (
              <li key={category.id} className="mb-4 not-first:border-t pt-2">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <DynIcon icon={category.icon} className="size-6" />
                  {category.name}
                  <CreateCategoryDialog
                    parentCategoryId={category.id}
                    className="ml-auto"
                    size="xs"
                  />
                </h3>
                {category.subcategories.length > 0 ? (
                  <ul className="mt-1 list-inside list-disc">
                    {category.subcategories.map((subcategory) => (
                      <li
                        key={subcategory.id}
                        className="flex gap-1 items-center"
                      >
                        <DynIcon icon={subcategory.icon} className="size-4 " />
                        {subcategory.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No subcategories.</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
