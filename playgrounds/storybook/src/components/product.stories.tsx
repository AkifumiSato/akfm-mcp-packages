import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Product } from "./product";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta: Meta<typeof Product> = {
  component: Product,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Product",
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    productId: 1,
  },
};

export const Loading: Story = {
  args: {
    productId: 1,
  },
  parameters: {
    msw: {
      handlers: [
        {
          delay: "infinite",
          method: "get",
          url: "https://dummyjson.com/products/1",
        },
      ],
    },
  },
};

export const NotFoundError: Story = {
  args: {
    productId: 999,
  },
  parameters: {
    msw: {
      handlers: [
        {
          method: "get",
          response: {
            message: "Product not found",
          },
          status: 404,
          url: "https://dummyjson.com/products/999",
        },
      ],
    },
  },
};
