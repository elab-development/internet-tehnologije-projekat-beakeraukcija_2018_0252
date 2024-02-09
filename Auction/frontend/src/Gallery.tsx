// Gallery.tsx
import React, { useState } from 'react'

interface NFTProps {
  imageUrl: string
  title: string
  description: string
  id: string
}

const Gallery: React.FC = () => {
  const nftData: NFTProps[] = [
    {
      imageUrl:
        'https://thumbor.forbes.com/thumbor/fit-in/900x510/https://www.forbes.com/advisor/in/wp-content/uploads/2022/03/monkey-g412399084_1280.jpg',
      title: 'Saint Ape',
      description: 'Description for Image 1 goes here.',
      id: '1036',
    },
    {
      imageUrl: 'https://contenthub-static.crypto.com/wp_media/2023/08/TOP-10-NFT-TOKENS-TO-KNOW-IN-2023-.jpg',
      title: 'Mafia Ape',
      description: 'Description for Image 2 goes here.',
      id: '1037',
    },
    {
      imageUrl:
        'https://i.guim.co.uk/img/media/ef8492feb3715ed4de705727d9f513c168a8b196/37_0_1125_675/master/1125.jpg?width=1200&height=900&quality=85&auto=format&fit=crop&s=cb647d991d8897cc8a81d2c33c4406d5',
      title: 'Bored Ape',
      description: 'Description for Image 3 goes here.',
      id: '1038',
    },
    {
      imageUrl:
        'https://i.seadn.io/gae/SuPXcvDKA_rp9mcYJzxtrT-Wy_6aGFrs8G0J3ZJXdZ6zmSkkKqjVIHWcm0s6ZzPOXu-i7CnuiN36ZP4_JEe1FLVw2aa_IwR2Gpop2w?auto=format&dpr=1&w=1000',
      title: 'King Ape',
      description: 'Description for Image 4 goes here.',
      id: '1039',
    },
    {
      imageUrl: 'https://www.hollywoodreporter.com/wp-content/uploads/2021/10/Mutant-Demon-Ape-Credit-0xb1-copy-H-2021.jpg?w=1296',
      title: 'Demon Ape',
      description: 'Description for Image 5 goes here.',
      id: '1040',
    },
    {
      imageUrl:
        'data:image/png;base64,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',
      title: 'Teen Ape',
      description: 'Description for Image 6 goes here.',
      id: '1041',
    },
  ]

  const [selectedNFT, setSelectedNFT] = useState<NFTProps | null>(null)

  const handleImageClick = (index: number) => {
    setSelectedNFT(nftData[index])
  }

  const handleCloseOverview = () => {
    setSelectedNFT(null)
  }

  return (
    <div className="container mx-auto mt-8 bg-gradient-to-b from-teal-500 to-teal-300 p-8 rounded-lg">
      <h2 className="text-3xl font-bold mb-4 text-white">NFT Gallery</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {nftData.map((nft, index) => (
          <div
            key={index}
            className="rounded-lg overflow-hidden shadow-lg border border-gray-300 transition transform hover:scale-105"
            onClick={() => handleImageClick(index)}
          >
            <img src={nft.imageUrl} alt={nft.title} className="w-full h-48 object-cover rounded-t-lg rounded-b-lg" />
            <div className="px-6 py-4">
              <p className="font-bold text-xl mb-2 text-teal-600">{nft.title}</p>
              <p className="text-gray-700">{nft.description}</p>
              <p className="text-gray-700">ID: {nft.id}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedNFT && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="absolute w-full h-full bg-gray-800 opacity-75" onClick={handleCloseOverview}></div>
          <div className="z-10 bg-white p-8 rounded-lg max-w-md">
            <img src={selectedNFT.imageUrl} alt={selectedNFT.title} className="w-full h-64 object-cover mb-4" />
            <p className="font-bold text-xl mb-2 text-teal-600">{selectedNFT.title}</p>
            <p className="text-gray-700">{selectedNFT.description}</p>
            <p className="text-gray-700">ID: {selectedNFT.id}</p>
            <button className="mt-4 p-2 bg-teal-500 text-white rounded" onClick={handleCloseOverview}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
